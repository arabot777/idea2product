'use server';

import { getTranslations } from 'next-intl/server';

import { dataActionWithPermission } from '@/lib/permission/guards/action';
import { SubscriptionPlanEdit } from '@/lib/db/crud/billing/subscription-plan.edit';
import { SubscriptionPlanMapper } from '@/lib/mappers/billing/subscription-plan';
import { AppError } from '@/lib/types/app.error';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { NewSubscriptionPlan } from '@/lib/db/schemas/billing/subscription-plan';
import { SubscriptionPlanDtoSchema } from '@/lib/types/billing/subscription-plan.dto';

export const createSubscriptionPlan = dataActionWithPermission(
  'createSubscriptionPlan',
  async (input: Partial<SubscriptionPlanDto>): Promise<SubscriptionPlanDto> => {
    const t = await getTranslations('BillingCreateSubscriptionPlan');
    try {
      // Validate input using the DTO schema to ensure required fields are present
      const validatedInput = SubscriptionPlanDtoSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(input);

      // Map DTO to DB schema for creation, ensuring all required fields for NewSubscriptionPlan are present
      const newSubscriptionPlan: NewSubscriptionPlan = {
        name: validatedInput.name,
        description: validatedInput.description,
        price: validatedInput.price,
        currency: validatedInput.currency,
        billingCycle: validatedInput.billingCycle,
        isActive: validatedInput.isActive ?? true,
        metadata: validatedInput.metadata,
      };

      const createdSubscriptionPlan = await SubscriptionPlanEdit.create(newSubscriptionPlan);
      return SubscriptionPlanMapper.toDTO(createdSubscriptionPlan);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('DATABASE_ERROR', error.message || t('failedToCreateSubscriptionPlan'));
    }
  }
);