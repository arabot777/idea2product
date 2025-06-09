import { z } from "zod";

// Response DTO Schema
export const StripeProductDtoSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string(),
  sourceType: z.string(),
  stripeAccountId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productDescription: z.string().nullable(),
  priceId: z.string(),
  priceUnitAmount: z.number().int(),
  priceCurrency: z.string(),
  priceInterval: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type export
export type StripeProductDTO = z.infer<typeof StripeProductDtoSchema>;
