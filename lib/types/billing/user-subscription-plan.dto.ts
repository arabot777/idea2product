import { z } from "zod";

import { Currency, BillingStatus, BillingCycle } from "./enum.bean";

export const UserSubscriptionPlanDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  status: z.nativeEnum(BillingStatus),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date().nullable(),
  cancelAtPeriodEnd: z.boolean().default(false),
  canceledAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  currency: z.nativeEnum(Currency),
  billingCycle: z.nativeEnum(BillingCycle),
  billingCount: z.number(),
  billingType: z.number(),
  externalId: z.string().nullable(),
  externalCheckoutUrl: z.string().nullable(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserSubscriptionPlanDto = z.infer<typeof UserSubscriptionPlanDtoSchema>;
