import { userSubscriptionPlans, UserSubscriptionPlan } from "../../db/schemas/billing/user-subscription-plan";
import { UserSubscriptionPlanDto } from "../../types/billing/user-subscription-plan.dto";
import { CurrencyType, BillingCycleType, BillingStatusType } from "../../types/billing/enum.bean";

export const UserSubscriptionPlanMapper = {
  toDTO: (model: UserSubscriptionPlan): UserSubscriptionPlanDto => {
    return {
      id: model.id,
      userId: model.userId,
      externalId: model.externalId,
      sourceId: model.sourceId,
      name: model.name,
      description: model.description,
      price: model.price,
      status: model.status as BillingStatusType,
      currentPeriodStart: model.currentPeriodStart,
      currentPeriodEnd: model.currentPeriodEnd,
      cancelAtPeriodEnd: model.cancelAtPeriodEnd || false,
      canceledAt: model.canceledAt,
      endedAt: model.endedAt,
      currency: model.currency as CurrencyType,
      billingCycle: model.billingCycle as BillingCycleType,
      isActive: model.isActive,
      metadata: model.metadata as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: UserSubscriptionPlanDto): Partial<UserSubscriptionPlan> => {
    return {
      id: dto.id,
      userId: dto.userId,
      externalId: dto.externalId,
      sourceId: dto.sourceId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      status: dto.status,
      currentPeriodStart: dto.currentPeriodStart,
      currentPeriodEnd: dto.currentPeriodEnd,
      cancelAtPeriodEnd: dto.cancelAtPeriodEnd,
      canceledAt: dto.canceledAt,
      endedAt: dto.endedAt,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      isActive: dto.isActive,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDTOList: (models: UserSubscriptionPlan[]): UserSubscriptionPlanDto[] => {
    return models.map(UserSubscriptionPlanMapper.toDTO);
  },

  fromDTOList: (dtos: UserSubscriptionPlanDto[]): Partial<UserSubscriptionPlan>[] => {
    return dtos.map(UserSubscriptionPlanMapper.fromDTO);
  },
};
