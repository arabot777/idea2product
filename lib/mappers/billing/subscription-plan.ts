import { subscriptionPlans, SubscriptionPlan } from "../../db/schemas/billing/subscription-plan";
import { SubscriptionPlanDto } from "../../types/billing/subscription-plan.dto";
import { CurrencyType, BillingCycleType } from "../../types/billing/enum.bean";

export const SubscriptionPlanMapper = {
  toDTO: (model: SubscriptionPlan): SubscriptionPlanDto => {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      price: model.price,
      currency: model.currency as CurrencyType,
      billingCycle: model.billingCycle as BillingCycleType,
      isActive: model.isActive,
      metadata: model.metadata as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: SubscriptionPlanDto): Partial<SubscriptionPlan> => {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      isActive: dto.isActive,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDTOList: (models: SubscriptionPlan[]): SubscriptionPlanDto[] => {
    return models.map(SubscriptionPlanMapper.toDTO);
  },

  fromDTOList: (dtos: SubscriptionPlanDto[]): Partial<SubscriptionPlan>[] => {
    return dtos.map(SubscriptionPlanMapper.fromDTO);
  },
};
