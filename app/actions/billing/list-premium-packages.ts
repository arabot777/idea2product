'use server';

import { withPermission } from '@/lib/permission/guards/action';
import { PremiumPackageQuery } from '@/lib/db/crud/billing/premium-package.query';
import { PremiumPackageMapper } from '@/lib/mappers/billing/premium-package';
import { AppError } from '@/lib/types/app.error';
import { PremiumPackageDto } from '@/lib/types/billing/premium-package.dto';
import { getTranslations } from 'next-intl/server';

export const listPremiumPackages = withPermission(
  'listPremiumPackages',
  async () => {
    const t = await getTranslations('BillingListPremiumPackages');
    try {
      const dbPremiumPackages = await PremiumPackageQuery.getAll();
      const appPremiumPackages: PremiumPackageDto[] = PremiumPackageMapper.toDTOList(dbPremiumPackages);
      return appPremiumPackages;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('UNKNOWN_ERROR', t('failedToListPremiumPackages'), error);
    }
  }
);