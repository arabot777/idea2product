'use server';

import { getTranslations } from 'next-intl/server';

import { dataActionWithPermission } from '@/lib/permission/guards/action';
import { PremiumPackageEdit } from '@/lib/db/crud/billing/premium-package.edit';
import { PremiumPackageMapper } from '@/lib/mappers/billing/premium-package';
import { AppError } from '@/lib/types/app.error';
import { PremiumPackageDto, PremiumPackageDtoSchema } from '@/lib/types/billing/premium-package.dto';
import { NewPremiumPackage } from '@/lib/db/schemas/billing/premium-package';

export const updatePremiumPackage = dataActionWithPermission(
  'updatePremiumPackage',
  async (input: Partial<PremiumPackageDto> & { id: string }): Promise<PremiumPackageDto> => {
    const { id, ...updatedFields } = input;

    const t = await getTranslations('BillingUpdatePremiumPackage');

    if (!id) {
      throw new AppError('VALIDATION_ERROR', t('premium_package_id_required'));
    }

    try {
      const validatedInput = PremiumPackageDtoSchema.partial().parse(updatedFields);

      const updateData: Partial<NewPremiumPackage> = {
        name: validatedInput.name,
        description: validatedInput.description,
        price: validatedInput.price,
        currency: validatedInput.currency,
        isActive: validatedInput.isActive,
        metadata: validatedInput.metadata,
        updatedAt: new Date(),
      };

      const updatedPremiumPackage = await PremiumPackageEdit.update(id, updateData);

      if (!updatedPremiumPackage) {
        throw new AppError('NOT_FOUND', t('premium_package_not_found', { id }));
      }

      return PremiumPackageMapper.toDTO(updatedPremiumPackage);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('DATABASE_ERROR', error.message || t('failed_to_update_premium_package'));
    }
  }
);