"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { TransactionQuery } from "@/lib/db/crud/payment/transaction.query";
import { TransactionEdit } from "@/lib/db/crud/payment/transaction.edit";
import { Transaction } from "@/lib/db/schemas/payment/transaction";
import { TransactionDto, TransactionStatus } from "@/lib/types/payment/transaction.dto";
import { TransactionMapper } from "@/lib/mappers/payment/transaction";
import { SubscriptionPlanMapper } from "@/lib/mappers/billing/subscription-plan";
import { getTranslations } from "next-intl/server";
import { SubscriptionPlanDto } from "@/lib/types/billing/subscription-plan.dto";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { UnibeeClient } from "@/lib/unibee/client";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { UserSubscriptionPlanEdit } from "@/lib/db/crud/billing/user-subscription-plan.edit";
import { BillingStatus } from "@/lib/types/billing/enum.bean";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";
import { UnibeePaymentTimeline, UnibeePaymentTimelineListResponse } from "@/lib/types/unibee";

// Maps Unibee's status to our internal transaction status.
const mapUnibeeStatusToLocal = (unibeeTimeline: UnibeePaymentTimeline): string | undefined => {
  const paymentStatus = unibeeTimeline?.status;
  // const refundStatus = unibeeTimeline..status;

  // Unibee payment status: 1=pending, 2=success, 3=failed, 4=cancel, 5=refund, 6=part_refund
  if (paymentStatus === 1) return TransactionStatus.COMPLETED;
  if (paymentStatus === 2) return TransactionStatus.FAILED;
  if (paymentStatus === 3) return TransactionStatus.CANCELED;
  if (paymentStatus === 5 || paymentStatus === 6) return TransactionStatus.PROCESSING;
  return TransactionStatus.PROCESSING;
};

/**
 * Asynchronously syncs transaction statuses from Unibee in the background.
 * This function is designed to be called in a "fire-and-forget" manner.
 * @param userId - The ID of the user whose transactions are to be synced.
 */
async function syncUnibeeTransactionsInBackground(userContext: UserContext): Promise<void> {
  try {
    // 1. Fetch all local transactions that are not in a final state.
    const localTransactions = await TransactionQuery.getUnfinishedTransactionsByUserId(userContext.id || "");
    if (localTransactions.length === 0) {
      console.log("No unfinished transactions to sync for user:", userContext.id);
      return;
    }

    // 2. Determine the start time for the Unibee query.
    const firstTransactionTime = localTransactions[0].createdAt;
    const createTimeStart = Math.floor(firstTransactionTime.getTime() / 1000);

    // 3. Fetch payment timelines from Unibee since the earliest transaction.
    const unibeeResponse = await UnibeeClient.getInstance().getPaymentTimelineList(
      { userId: userContext.unibeeExternalId, createTimeStart, page: 0, count: 100 }
    );

    if (unibeeResponse.code !== 0) {
      console.error("Failed to fetch Unibee transactions:", unibeeResponse.message);
      return;
    }

    // Create a map for quick lookups of Unibee transactions by their ID.
    const unibeeTimelineMap = new Map(
      unibeeResponse.data.paymentTimeLines.map((t) => [t.transactionId || t.paymentId, t])
    );
    let availableUnibeeTimelines = [...unibeeResponse.data.paymentTimeLines].sort((a, b) => a.createTime - b.createTime);

    // 4. Process each local transaction.
    for (const localTx of localTransactions) {
      let matchedUnibeeTx: UnibeePaymentTimeline | undefined;

      if (localTx.externalId && unibeeTimelineMap.has(localTx.externalId)) {
        // Case 1: Transaction is already linked. Sync its status.
        matchedUnibeeTx = unibeeTimelineMap.get(localTx.externalId);
        if (matchedUnibeeTx) {
          const newStatus = mapUnibeeStatusToLocal(matchedUnibeeTx);
          if (newStatus && newStatus !== localTx.status) {
            await TransactionEdit.update(localTx.id, { status: newStatus });
            if (newStatus === TransactionStatus.COMPLETED) {
              if(localTx.userId){
                const plan = await SubscriptionPlanQuery.getById(localTx.associatedId);
                if(plan){
                  await ProfileEdit.update(localTx.userId, {subscription:[plan.name]});
                  await cache.del(CacheKeys.USER_PROFILE(localTx.userId));
                }
              }
            }
          }
        }
      } else if (!localTx.externalId) {
        // Case 2: Transaction is not linked. Find a match based on time.
        const bestMatchIndex = availableUnibeeTimelines.findIndex(
          (unibeeTx) => new Date(unibeeTx.createTime * 1000) > localTx.createdAt
        );

        if (bestMatchIndex !== -1) {
          matchedUnibeeTx = availableUnibeeTimelines[bestMatchIndex];
          const newStatus = mapUnibeeStatusToLocal(matchedUnibeeTx);
          const externalId = matchedUnibeeTx.transactionId || matchedUnibeeTx.paymentId;

          await TransactionEdit.update(localTx.id, {
            externalId: externalId,
            status: newStatus || localTx.status,
          });
          console.log(`Transaction ${localTx.id} matched and synced with Unibee transaction ${externalId}.`);

          // Remove the matched timeline to prevent it from being used again.
          availableUnibeeTimelines.splice(bestMatchIndex, 1);
        } else {
          console.warn(`No matching Unibee transaction found for local transaction: ${localTx.id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error during background Unibee transaction sync:", error);
  }
}

export type UnibeeSyncTransactionStatusResult = {
  message: string;
  plan?: SubscriptionPlanDto;
  transaction?: TransactionDto;
};

export const unibeeSyncTransactionStatus = dataActionWithPermission(
  "unibeeSyncTransactionStatus",
  async (transactionId: string, userContext: UserContext): Promise<UnibeeSyncTransactionStatusResult> => {
    const t = await getTranslations("BillingUpdateTransactionStatus");

    // Fire-and-forget the background sync.
    syncUnibeeTransactionsInBackground(userContext).catch((error) => {
      console.error("Failed to run background sync:", error);
    });

    // Immediately find and return the transaction requested by the user.
    const transaction = await TransactionQuery.getById(transactionId);
    if (!transaction) {
      return { message: t("transactionNotFound") };
    }

    const subscriptionPlan = await SubscriptionPlanQuery.getById(transaction.associatedId || "");
    if (!subscriptionPlan) {
      return { message: t("subscriptionPlanNotFound") };
    }

    return {
      message: t("syncStarted"),
      plan: SubscriptionPlanMapper.toDTO(subscriptionPlan),
      transaction: TransactionMapper.toDTO(transaction),
    };
  }
);
