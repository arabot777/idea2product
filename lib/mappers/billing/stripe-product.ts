import { StripeProduct, NewStripeProduct } from "@/lib/db/schemas/billing/stripe-product";
import { StripeProductDTO } from "@/lib/types/billing/stripe-product.dto";

export const StripeProductMapper = {
  /**
   * Converts a database model to a DTO object.
   * @param model The database model.
   * @returns The converted DTO object.
   */
  toDTO: (model: StripeProduct): StripeProductDTO => {
    return {
      id: model.id,
      sourceId: model.sourceId,
      sourceType: model.sourceType,
      stripeAccountId: model.stripeAccountId,
      productId: model.productId,
      productName: model.productName,
      productDescription: model.productDescription || null,
      priceId: model.priceId,
      priceUnitAmount: model.priceUnitAmount,
      priceCurrency: model.priceCurrency,
      priceInterval: model.priceInterval || null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  /**
   * Converts a DTO object to a database model.
   * @param dto The DTO object.
   * @returns The converted database model.
   */
  fromDTO: (dto: Partial<StripeProductDTO>): Partial<StripeProduct> => {
    const model: Partial<StripeProduct> = {};
    
    if (dto.sourceId !== undefined) {
      model.sourceId = dto.sourceId;
    }
    if (dto.sourceType !== undefined) {
      model.sourceType = dto.sourceType;
    }
    if (dto.stripeAccountId !== undefined) {
      model.stripeAccountId = dto.stripeAccountId;
    }
    if (dto.productId !== undefined) {
      model.productId = dto.productId;
    }
    if (dto.productName !== undefined) {
      model.productName = dto.productName;
    }
    if (dto.productDescription !== undefined) {
      model.productDescription = dto.productDescription || undefined;
    }
    if (dto.priceId !== undefined) {
      model.priceId = dto.priceId;
    }
    if (dto.priceUnitAmount !== undefined) {
      model.priceUnitAmount = dto.priceUnitAmount;
    }
    if (dto.priceCurrency !== undefined) {
      model.priceCurrency = dto.priceCurrency;
    }
    if (dto.priceInterval !== undefined) {
      model.priceInterval = dto.priceInterval || undefined;
    }
    
    return model;
  },

  /**
   * Converts an array of database models to an array of DTOs.
   * @param models The array of database models.
   * @returns The converted array of DTOs.
   */
  toDTOList: (models: StripeProduct[]): StripeProductDTO[] => {
    return models.map(StripeProductMapper.toDTO);
  },

  /**
   * Converts an array of DTOs to an array of database models.
   * @param dtos The array of DTOs.
   * @returns The converted array of database models.
   */
  fromDTOList: (dtos: Partial<StripeProductDTO>[]): Partial<StripeProduct>[] => {
    return dtos.map(StripeProductMapper.fromDTO);
  },
}
