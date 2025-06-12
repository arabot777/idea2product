import { z } from "zod";
import { Currency, BillingCycle } from "./enum.bean";

export const SubscriptionPlanDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.nativeEnum(Currency),
  billingCycle: z.nativeEnum(BillingCycle),
  billingCount: z.number(),
  billingType: z.number(),
  externalId: z.string(),
  externalCheckoutUrl: z.string(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SubscriptionPlanDto = z.infer<typeof SubscriptionPlanDtoSchema>;
