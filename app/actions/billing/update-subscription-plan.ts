'use server';

import { dataActionWithPermission } from '@/lib/permission/guards/action';
import { SubscriptionPlanEdit } from '@/lib/db/crud/billing/subscription-plan.edit';
import { SubscriptionPlanMapper } from '@/lib/mappers/billing/subscription-plan';
import { AppError } from '@/lib/types/app.error';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { SubscriptionPlanDtoSchema } from '@/lib/types/billing/subscription-plan.dto';
import { NewSubscriptionPlan } from '@/lib/db/schemas/billing/subscription-plan';
import { getTranslations } from 'next-intl/server';

export const updateSubscriptionPlan = dataActionWithPermission(
  'updateSubscriptionPlan',
  async (input: Partial<SubscriptionPlanDto> & { id: string }): Promise<SubscriptionPlanDto> => {
    const { id, ...updatedFields } = input;
    const t = await getTranslations('BillingUpdateSubscriptionPlan');

    if (!id) {
      throw new AppError('VALIDATION_ERROR', t('updateSubscriptionPlan.idRequired'));
    }

    try {
      // Validate input using a partial DTO schema
      const validatedInput = SubscriptionPlanDtoSchema.partial().parse(updatedFields);

      const updateData: Partial<NewSubscriptionPlan> = {
        name: validatedInput.name,
        description: validatedInput.description,
        price: validatedInput.price,
        currency: validatedInput.currency,
        billingCycle: validatedInput.billingCycle,
        isActive: validatedInput.isActive,
        metadata: validatedInput.metadata,
        updatedAt: new Date(),
      };

      const updatedSubscriptionPlan = await SubscriptionPlanEdit.update(id, updateData);

      if (!updatedSubscriptionPlan) {
        throw new AppError('NOT_FOUND', t('updateSubscriptionPlan.notFound', { id }));
      }

      return SubscriptionPlanMapper.toDTO(updatedSubscriptionPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('DATABASE_ERROR', error.message || t('updateSubscriptionPlan.failedToUpdate'));
    }
  }
);