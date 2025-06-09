"use server";

import { getTranslations } from 'next-intl/server';

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { PremiumPackageQuery } from "@/lib/db/crud/billing/premium-package.query";
import { PremiumPackageMapper } from "@/lib/mappers/billing/premium-package";
import { AppError } from "@/lib/types/app.error";
import { PremiumPackageDto } from "@/lib/types/billing/premium-package.dto";

export const getPremiumPackage = dataActionWithPermission(
  "getPremiumPackage",
  async (id: string): Promise<PremiumPackageDto> => {
    const t = await getTranslations('BillingGetPremiumPackage');
    try {
      const dbPremiumPackage = await PremiumPackageQuery.getById(id);

      if (!dbPremiumPackage) {
        throw new AppError("NOT_FOUND", t('premiumPackageNotFound', { id }));
      }

      return PremiumPackageMapper.toDTO(dbPremiumPackage);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("UNKNOWN_ERROR", t('failedToGetPremiumPackage'), error);
    }
  }
);