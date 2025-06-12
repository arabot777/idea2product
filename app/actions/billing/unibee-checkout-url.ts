"use server";

import { getTranslations } from "next-intl/server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { AppError } from "@/lib/types/app.error";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { BillingStatus } from "@/lib/types/billing/enum.bean";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { ActivityLogEdit } from "@/lib/db/crud/activity/activity-log.edit";
import { TransactionEdit } from "@/lib/db/crud/payment/transaction.edit";
import { TransactionStatus } from "@/lib/types/payment/transaction.dto";
import { UserSubscriptionPlanQuery } from "@/lib/db/crud/billing/user-subscription-plan.query";
import { UnibeanClient } from "@/lib/unibean/client";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";

export const unibeeCheckoutUrl = dataActionWithPermission(
  "unibeeCheckoutUrl",
  async (subscriptionPlanId: string, userContext: UserContext): Promise<{ checkoutUrl: string; transactionId: string }> => {
    const t = await getTranslations("BillingStripeCheckoutSession");
    if (!subscriptionPlanId) {
      throw new AppError("VALIDATION_ERROR", t("validationError.subscriptionPlanRequired"));
    }

    const existingSubscription = await UserSubscriptionPlanQuery.getByUserIdAndStatus(userContext.id || "", BillingStatus.ACTIVE);
    if (existingSubscription) {
      throw new AppError("VALIDATION_ERROR", t("validationError.notSupportChangeSubscription"));
    }

    try {
      const subscriptionPlan = await SubscriptionPlanQuery.getById(subscriptionPlanId);
      if (!subscriptionPlan) {
        throw new AppError("NOT_FOUND", t("notFound.subscriptionPlanNotFound", { subscriptionPlanId }));
      }

      if (!subscriptionPlan.externalCheckoutUrl) {
        throw new AppError("VALIDATION_ERROR", t("validationError.subscriptionPlanExternalCheckoutUrlRequired"));
      }

      await ActivityLogEdit.create({
        userId: userContext.id,
        action: "TAY_SUBSCRIPTION_PLAN",
      });

      const transaction = await TransactionEdit.create({
        userId: userContext.id,
        associatedId: subscriptionPlan.id,
        type: "subscription",
        amount: subscriptionPlan.price,
        currency: subscriptionPlan.currency,
        status: TransactionStatus.PENDING,
        description: "",
        metadata: {},
      });

      const sessionResponse = await UnibeanClient.getInstance().createClientSession(
        {
          email: userContext.email,
          externalUserId: userContext.id,
          cancelUrl: `${process.env.NEXT_PUBLIC_URL || ""}/subscribe-plan/confirm?transactionId=${transaction.id}`,
          returnUrl: `${process.env.NEXT_PUBLIC_URL || ""}/subscribe-plan/confirm?transactionId=${transaction.id}`,
        }
      );

      if (sessionResponse.code !== 0) {
        throw new AppError("UNIBEE_API_ERROR", t("unibeeCheckoutSession.unibeeApiError"), sessionResponse.message);
      }
      const checkoutUrl = new URL(subscriptionPlan.externalCheckoutUrl);
      checkoutUrl.searchParams.append("session", sessionResponse.data.clientSession);

      await ProfileEdit.update(userContext.id || "", { unibeeExternalId: sessionResponse.data.userId });
      return { checkoutUrl: checkoutUrl.toString(), transactionId: transaction.id };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("UNKNOWN_ERROR", error.message || t("unknownError.unexpectedError"));
    }
  }
);
