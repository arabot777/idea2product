import { pgTable, text, timestamp, integer, jsonb, boolean, pgEnum, uuid, doublePrecision } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { currencyEnum, billingCycleEnum } from "./enum";

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the subscription
  name: text("name").notNull(), // Subscription name
  description: text("description").notNull(), // Subscription description
  price: doublePrecision("price").notNull(), // Subscription price
  currency: currencyEnum("currency").notNull(), // Subscription currency
  billingCycle: billingCycleEnum("billing_cycle").notNull(), // Billing cycle
  isActive: boolean("is_active").notNull().default(true), // Whether enabled
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(), // Record creation time
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last record update time
});

export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlans>;
export type NewSubscriptionPlan = InferInsertModel<typeof subscriptionPlans>;
