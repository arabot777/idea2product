"use server";

import { getTranslations } from "next-intl/server";

import { actionWithPermission } from "@/lib/permission/guards/action";
import { UserSubscriptionPlanQuery } from "@/lib/db/crud/billing/user-subscription-plan.query";
import { UserSubscriptionPlanEdit } from "@/lib/db/crud/billing/user-subscription-plan.edit"; // Import UserSubscriptionPlanEdit
import { UserSubscriptionPlanMapper } from "@/lib/mappers/billing/user-subscription-plan";
import { AppError } from "@/lib/types/app.error";
import { UserSubscriptionPlanDto } from "@/lib/types/billing/user-subscription-plan.dto";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { BillingStatus, BillingStatusType, CurrencyType, BillingCycleType } from "@/lib/types/billing/enum.bean";
import { UnibeanClient } from "@/lib/unibean/client";
import { NewUserSubscriptionPlan } from "@/lib/db/schemas/billing/user-subscription-plan";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";

// Define the Unibee API response type for user subscription detail
interface UnibeeUserSubscription {
  addonData: string;
  amount: number;
  billingCycleAnchor: number;
  cancelAtPeriodEnd: number; // 123
  cancelOrExpireTime: number; // 123
  cancelReason: string;
  countryCode: string;
  createTime: number; // 123
  currency: string;
  currentPeriodEnd: number; // 123
  currentPeriodPaid: number; // 123
  currentPeriodStart: number; // 123
  defaultPaymentMethodId: string;
  dunningTime: number; // 123
  externalSubscriptionId: string;
  features: string;
  firstPaidTime: number; // 123
  gasPayer: string;
  gatewayId: number; // 123
  gatewayStatus: string;
  id: number; // 123
  lastUpdateTime: number; // 123
  latestInvoiceId: string;
  link: string;
  merchantId: number; // 123
  metadata: Record<string, any>;
  originalPeriodEnd: number; // 123
  pendingUpdateId: string;
  planId: number; // 123
  productId: number; // 123
  quantity: number; // 123
  returnUrl: string;
  status: number; // 123 (e.g., 1-active, 2-canceled)
  subscriptionId: string; // This is the actual Unibee subscription ID
  taskTime: string;
  taxPercentage: number; // 123
  testClock: number; // 123
  trialEnd: number; // 123
  type: number; // 123
  userId: number; // 123 (Unibee's internal user ID)
  vatNumber: string;
}

interface UnibeeUserSubscriptionResponse {
  code: number;
  data: {
    subscription: UnibeeUserSubscription;
    plan: {
      planName: string;
      description: string;
      amount: number;
      currency: string;
      intervalUnit: string;
      intervalCount: number;
      checkoutUrl: string;
      type: number;
    };
  };
  message: string;
  redirect: string;
  requestId: string;
}

// Helper function to map Unibee status number to BillingStatusType
const mapUnibeeStatusToBillingStatusType = (unibeeStatus: number): BillingStatusType => {
  switch (unibeeStatus) {
    case 1: // pending
      return BillingStatus.PENDING;
    case 2: // active
      return BillingStatus.ACTIVE;
    case 3: // pending inactive
      return BillingStatus.PENDING_INACTIVE;
    case 4: // canceled
      return BillingStatus.CANCELED;
    case 5: // expired
      return BillingStatus.EXPIRED;
    case 6: // paused
      return BillingStatus.PAUSED;
    case 7: // incomplete
      return BillingStatus.INCOMPLETE;
    case 8: // processing
      return BillingStatus.PROCESSING;
    case 9: // failed
      return BillingStatus.FAILED;
    default:
      return BillingStatus.INCOMPLETE;
  }
};

async function syncUserSubscriptionWithUnibee(userContext: UserContext, t: any) {
  try {
    if (!userContext.unibeeExternalId) {
      console.warn("User does not have a Unibee external ID. Skipping user subscription sync.");
      return false;
    }

    // Use POST request as per user's feedback
    const response = await UnibeanClient.getInstance().request<UnibeeUserSubscriptionResponse>("POST", "/merchant/subscription/user_subscription_detail", {
      userId: userContext.unibeeExternalId, // Use userId as parameter for POST request
    });

    if (response.code !== 0) {
      throw new AppError("UNIBEE_API_ERROR", "Failed to fetch Unibee user subscription", response.message);
    }

    const unibeeSubscription = response.data.subscription;
    const unibeePlan = response.data.plan; // Get plan details from response

    let billingCycle: BillingCycleType;
    if (unibeePlan.intervalUnit === "month" && unibeePlan.intervalCount === 1) {
      billingCycle = "monthly";
    } else if (unibeePlan.intervalUnit === "year" && unibeePlan.intervalCount === 1) {
      billingCycle = "annual";
    } else {
      console.warn(`Unknown billing cycle: ${unibeePlan.intervalUnit} ${unibeePlan.intervalCount}. Defaulting to 'monthly'.`);
      billingCycle = "monthly";
    }

    const subscriptionPlan = await SubscriptionPlanQuery.getByExternalId(String(unibeeSubscription.planId));
    if (!subscriptionPlan) {
      throw new AppError("NOT_FOUND", t("notFound.subscriptionPlanNotFound"));
    }

    const mappedStatus = mapUnibeeStatusToBillingStatusType(unibeeSubscription.status);

    const newUserSubscriptionPlan: NewUserSubscriptionPlan = {
      userId: userContext.id!,
      sourceId: subscriptionPlan?.id || "", // Use planId from subscription, convert to string
      name: subscriptionPlan?.name || "", // Use planName from subscription, convert to string
      description: subscriptionPlan?.description || "", // Use description from subscription, convert to string
      price: subscriptionPlan?.price || 0, // Use price from subscription, convert to string
      status: mappedStatus,
      currentPeriodStart: new Date(unibeeSubscription.currentPeriodStart * 1000),
      currentPeriodEnd: new Date(unibeeSubscription.currentPeriodEnd * 1000),
      cancelAtPeriodEnd: unibeeSubscription.cancelAtPeriodEnd === 1, // Convert number to boolean
      canceledAt: unibeeSubscription.cancelOrExpireTime ? new Date(unibeeSubscription.cancelOrExpireTime * 1000) : null,
      endedAt: unibeeSubscription.cancelOrExpireTime ? new Date(unibeeSubscription.cancelOrExpireTime * 1000) : null, // Assuming endedAt is cancelOrExpireTime
      currency: unibeePlan.currency.toLowerCase() as CurrencyType,
      billingCycle: billingCycle,
      billingCount: unibeePlan.intervalCount,
      billingType: unibeePlan.type, // Use type from plan
      externalId: unibeeSubscription.subscriptionId, // Use subscriptionId as externalId
      externalCheckoutUrl: unibeePlan.checkoutUrl,
      isActive: unibeeSubscription.status === 1, // Active status is 1
      metadata: unibeeSubscription.metadata || {},
      createdAt: new Date(unibeeSubscription.createTime * 1000),
      updatedAt: new Date(unibeeSubscription.lastUpdateTime * 1000),
    };

    const existingUserSubscription = await UserSubscriptionPlanQuery.getByExternalId(unibeeSubscription.subscriptionId);

    if (existingUserSubscription) {
      await UserSubscriptionPlanEdit.update(existingUserSubscription.id, newUserSubscriptionPlan);
    } else {
      await UserSubscriptionPlanEdit.create(newUserSubscriptionPlan);
    }
  } catch (error) {
    console.error("Error syncing user subscription in background:", error);
  }
}
export const getUserSubscriptionPlan = actionWithPermission(
  "getUserSubscriptionPlan",
  async (userContext: UserContext): Promise<UserSubscriptionPlanDto> => {
    const t = await getTranslations("BillingGetUserSubscriptionPlan");

    // Asynchronously trigger Unibee user subscription sync without blocking the current task
    Promise.resolve().then(() => syncUserSubscriptionWithUnibee(userContext, t));

    const userSubscriptionPlan = await UserSubscriptionPlanQuery.getByUserIdAndStatus(userContext.id || "", BillingStatus.ACTIVE);
    if (!userSubscriptionPlan) {
      throw new AppError("NOT_FOUND", t("notFound.userSubscriptionPlanNotFound"));
    }

    const userSubscriptionPlanDto = UserSubscriptionPlanMapper.toDTO(userSubscriptionPlan);
    // Check and update userContext.subscription
    // Assuming userContext.subscription stores a list of IDs for the user's active subscriptions
    if (userContext?.subscription?.[0] !== userSubscriptionPlanDto.name) {
      await ProfileEdit.update(userContext.id!, { subscription: [userSubscriptionPlanDto.name] });
      await cache.del(CacheKeys.USER_PROFILE(userContext.id!));
    }

    return userSubscriptionPlanDto;
  }
);
