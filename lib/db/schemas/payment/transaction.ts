import { pgTable, uuid, text, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "../auth/profile";
import { currencyEnum } from "../billing/enum";

// Transaction status enum
export const transactionStatusEnum = [
  "pending", // In progress
  "completed", // Completed
  "failed", // Failed
  "refunded", // Refunded
  "canceled", // Canceled
] as const;
export type TransactionStatus = (typeof transactionStatusEnum)[number];

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id),
  externalId: text("external_id"), // External payment system ID (e.g., Stripe payment_intent ID)
  associatedId: uuid("associated_id").notNull(), // ID of the associated purchased subscription plan or premium package
  type: text("type").notNull(), // Transaction type: subscription, premium_package
  amount: doublePrecision("amount").notNull(), // Transaction amount
  currency: currencyEnum("currency").notNull().default("usd"), // Currency type
  status: text("status").notNull(), // Transaction status
  description: text("description"),
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  profile: one(profiles, {
    fields: [transactions.userId],
    references: [profiles.id],
  }),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
