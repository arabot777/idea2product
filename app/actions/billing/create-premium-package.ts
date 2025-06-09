'use server';

import { dataActionWithPermission } from '@/lib/permission/guards/action';
import { PremiumPackageEdit } from '@/lib/db/crud/billing/premium-package.edit';
import { PremiumPackageMapper } from '@/lib/mappers/billing/premium-package';
import { AppError } from '@/lib/types/app.error';
import { PremiumPackageDto, PremiumPackageDtoSchema } from '@/lib/types/billing/premium-package.dto';
import { NewPremiumPackage } from '@/lib/db/schemas/billing/premium-package';
import { getTranslations } from 'next-intl/server';

export const createPremiumPackage = dataActionWithPermission(
  'createPremiumPackage',
  async (input: Partial<PremiumPackageDto>): Promise<PremiumPackageDto> => {
    const t = await getTranslations('BillingCreatePremiumPackage');
    try {
      const validatedInput = PremiumPackageDtoSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(input);

      const newPremiumPackage: NewPremiumPackage = {
        name: validatedInput.name,
        description: validatedInput.description,
        price: validatedInput.price,
        currency: validatedInput.currency,
        isActive: validatedInput.isActive ?? true,
        metadata: validatedInput.metadata,
      };

      const createdPremiumPackage = await PremiumPackageEdit.create(newPremiumPackage);
      return PremiumPackageMapper.toDTO(createdPremiumPackage);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('DATABASE_ERROR', error.message || t('failedToCreatePremiumPackage'));
    }
  }
);