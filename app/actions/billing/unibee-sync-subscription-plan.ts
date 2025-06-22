"use server";

import { UnibeeClient } from "@/lib/unibee/client";
import { withPermission } from "@/lib/permission/guards/action";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { AppError } from "@/lib/types/app.error";
import { NewSubscriptionPlan } from "@/lib/db/schemas/billing/subscription-plan";
import { CurrencyType, BillingCycleType } from "@/lib/types/billing/enum.bean";
import { UnibeePlanListResponse } from "@/lib/types/unibee";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";

export const unibeeSyncSubscriptionPlan = withPermission("unibeeSyncSubscriptionPlan", async (): Promise<boolean> => {
  try {
    const response = await UnibeeClient.getInstance().getPlanList({
      page: 0,
      count: 99,
    });

    if (response.code !== 0) {
      throw new AppError("UNIBEE_API_ERROR", "Failed to fetch Unibee plans", response.message);
    }

    const unibeePlans = response.data.plans.map((p) => p.plan);
    const billableMetrics = await BillableMetricsQuery.getAll();
    const billableMetricMap = new Map(billableMetrics.map((m) => [m.unibeeExternalId, m]));
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
      if (unibeePlan.metricLimits) {
        unibeePlan.metricLimits.forEach((metricLimit) => {
          const billableMetric = billableMetricMap.get(metricLimit.metricId.toString());
          if (billableMetric) {
            if (!metadata.features) {
              metadata.features = [];
            }
            if (billableMetric.displayDescription) {
              if (billableMetric.displayDescription.includes("%s")) {
                metadata.features.push(billableMetric.displayDescription.replace("%s", metricLimit.metricLimit.toString()));
              } else {
                metadata.features.push(billableMetric.displayDescription);
              }
            }
          }
        });
      }

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
