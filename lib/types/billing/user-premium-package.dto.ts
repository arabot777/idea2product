import { z } from "zod";

import { Currency, BillingStatus } from "./enum.bean";

export const UserPremiumPackageDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  externalId: z.string().nullable(),
  sourceId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  status: z.nativeEnum(BillingStatus),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date().nullable(),
  canceledAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  currency: z.nativeEnum(Currency),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserPremiumPackageDto = z.infer<typeof UserPremiumPackageDtoSchema>;
