"use server";

import { getTranslations } from "next-intl/server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { SubscriptionPlanMapper } from "@/lib/mappers/billing/subscription-plan";
import { AppError } from "@/lib/types/app.error";
import { SubscriptionPlanDto } from "@/lib/types/billing/subscription-plan.dto";

export const getSubscriptionPlan = dataActionWithPermission(
  "getSubscriptionPlan",
  async (id: string): Promise<SubscriptionPlanDto> => {
    const t = await getTranslations("BillingGetSubscriptionPlan");
    try {
      const dbSubscriptionPlan = await SubscriptionPlanQuery.getById(id);

      if (!dbSubscriptionPlan) {
        throw new AppError("NOT_FOUND", t("subscriptionPlanNotFound", { id }));
      }

      return SubscriptionPlanMapper.toDTO(dbSubscriptionPlan);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("UNKNOWN_ERROR", t("failedToGetSubscriptionPlan"), error);
    }
  }
);