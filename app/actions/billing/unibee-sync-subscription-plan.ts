"use server";

import { UnibeanClient } from "@/lib/unibean/client";
import { withPermission } from "@/lib/permission/guards/action";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { AppError } from "@/lib/types/app.error";
import { NewSubscriptionPlan } from "@/lib/db/schemas/billing/subscription-plan";
import { CurrencyType, BillingCycleType } from "@/lib/types/billing/enum.bean";
// Define the Unibee API response type
interface UnibeePlan {
  id: string;
  planName: string;
  description: string;
  amount: number;
  currency: string;
  intervalUnit: string;
  intervalCount: number;
  checkoutUrl: string;
  status: number; // 1-Editing, 2-Active, 3-InActive, 4-SoftArchive, 5-HardArchive
  type: number; // 1-main plan, 2-addon plan, 3-onetime
  createTime: number; // timestamp
}

interface UnibeePlanListResponse {
  code: number;
  data: {
    plans: {
      plan: UnibeePlan;
    }[];
    total: number;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export const unibeeSyncSubscriptionPlan = withPermission("unibeeSyncSubscriptionPlan", async (): Promise<boolean> => {
  try {
    const response = await UnibeanClient.getInstance().request<UnibeePlanListResponse>("GET", "/merchant/plan/list", { page: 0, count: 99 });

    if (response.code !== 0) {
      throw new AppError("UNIBEE_API_ERROR", "Failed to fetch Unibee plans", response.message);
    }

    const unibeePlans = response.data.plans.map((p) => p.plan);
    const subscriptionPlans: NewSubscriptionPlan[] = unibeePlans.map((unibeePlan) => {
      let billingCycle: BillingCycleType;
      if (unibeePlan.intervalUnit === "month" && unibeePlan.intervalCount === 1) {
        billingCycle = "monthly";
      } else if (unibeePlan.intervalUnit === "year" && unibeePlan.intervalCount === 1) {
        billingCycle = "annual";
      } else {
        console.warn(`Unknown billing cycle: ${unibeePlan.intervalUnit} ${unibeePlan.intervalCount}`);
        billingCycle = "monthly";
      }
      const metadata: Record<string, any> = {};

      return {
        name: unibeePlan.planName,
        description: unibeePlan.description,
        price: unibeePlan.amount / 100, // Unibee amount is in cents
        currency: unibeePlan.currency.toLowerCase() as CurrencyType, // Convert to lowercase and assert as CurrencyType
        billingCycle: billingCycle,
        billingType: unibeePlan.type,
        billingCount: unibeePlan.intervalCount,
        externalId: unibeePlan.id,
        externalCheckoutUrl: unibeePlan.checkoutUrl,
        isActive: unibeePlan.status === 2, // 2-Active
        metadata: metadata,
        createdAt: new Date(unibeePlan.createTime * 1000), // Convert Unibee timestamp from seconds to milliseconds
        updatedAt: new Date(), // Set update time to current time
      };
    });

    for (const planDto of subscriptionPlans) {
      const existingPlan = await SubscriptionPlanQuery.getByExternalId(planDto.externalId!);
      if (existingPlan) {
        await SubscriptionPlanQuery.update(existingPlan.id, planDto);
      } else {
        await SubscriptionPlanQuery.create(planDto);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("UNKNOWN_ERROR", "Failed to sync subscription plans", error);
  }
});
