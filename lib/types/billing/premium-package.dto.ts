import { z } from "zod";
import { Currency } from "./enum.bean";

export const PremiumPackageDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.nativeEnum(Currency),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PremiumPackageDto = z.infer<typeof PremiumPackageDtoSchema>;
