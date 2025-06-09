import { premiumPackages, PremiumPackage } from "../../db/schemas/billing/premium-package";
import { PremiumPackageDto } from "../../types/billing/premium-package.dto";
import { CurrencyType } from "../../types/billing/enum.bean";

export const PremiumPackageMapper = {
  toDTO: (model: PremiumPackage): PremiumPackageDto => {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      price: model.price,
      currency: model.currency as CurrencyType,
      isActive: model.isActive,
      metadata: model.metadata as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: PremiumPackageDto): Partial<PremiumPackage> => {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      currency: dto.currency,
      isActive: dto.isActive,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDTOList: (models: PremiumPackage[]): PremiumPackageDto[] => {
    return models.map(PremiumPackageMapper.toDTO);
  },

  fromDTOList: (dtos: PremiumPackageDto[]): Partial<PremiumPackage>[] => {
    return dtos.map(PremiumPackageMapper.fromDTO);
  },
};
