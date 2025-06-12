import { z } from "zod";

// Transaction status enum
export const TransactionStatus = {
  PENDING: "pending", // waiting for unibee
  PROCESSING: "processing", // In progress
  COMPLETED: "completed", // Completed
  FAILED: "failed", // Failed
  REFUNDED: "refunded", // Refunded
  CANCELED: "canceled", // Canceled
} as const;
export type TransactionStatusType = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  externalId: z.string().nullable(), // External transaction ID
  associatedId: z.string(), // ID of the associated subscription plan or premium package purchased
  type: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  currentPeriodEnd: z.date().nullable().optional(), // Add currentPeriodEnd
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
