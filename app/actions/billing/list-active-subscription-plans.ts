'use server';

import { withPermission } from '@/lib/permission/guards/action';
import { SubscriptionPlanQuery } from '@/lib/db/crud/billing/subscription-plan.query';
import { SubscriptionPlanMapper } from '@/lib/mappers/billing/subscription-plan';
import { AppError } from '@/lib/types/app.error';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';

export const listActiveSubscriptionPlans = withPermission(
  'listActiveSubscriptionPlans',
  async () => {
    try {
      const dbPlans = await SubscriptionPlanQuery.getAllActive();
      const appPlans: SubscriptionPlanDto[] = SubscriptionPlanMapper.toDTOList(dbPlans);
      return appPlans;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('UNKNOWN_ERROR', 'Failed to list active subscription plans',error);
    }
  }
);