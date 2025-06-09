import { userPremiumPackages, UserPremiumPackage } from "../../db/schemas/billing/user-premium-package";
import { UserPremiumPackageDto } from "../../types/billing/user-premium-package.dto";
import { CurrencyType, BillingStatusType } from "../../types/billing/enum.bean";

export const UserPremiumPackageMapper = {
  toDTO: (model: UserPremiumPackage): UserPremiumPackageDto => {
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
      canceledAt: model.canceledAt,
      endedAt: model.endedAt,
      currency: model.currency as CurrencyType,
      isActive: model.isActive,
      metadata: model.metadata as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: UserPremiumPackageDto): Partial<UserPremiumPackage> => {
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
      canceledAt: dto.canceledAt,
      endedAt: dto.endedAt,
      currency: dto.currency,
      isActive: dto.isActive,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDTOList: (models: UserPremiumPackage[]): UserPremiumPackageDto[] => {
    return models.map(UserPremiumPackageMapper.toDTO);
  },

  fromDTOList: (dtos: UserPremiumPackageDto[]): Partial<UserPremiumPackage>[] => {
    return dtos.map(UserPremiumPackageMapper.fromDTO);
  },
};
