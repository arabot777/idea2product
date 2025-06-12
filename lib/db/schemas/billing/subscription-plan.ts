import { pgTable, text, timestamp, integer, jsonb, boolean, pgEnum, uuid, doublePrecision } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { billingCycleEnum } from "./enum";

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the subscription
  name: text("name").notNull(), // Subscription name
  description: text("description").notNull(), // Subscription description
  price: doublePrecision("price").notNull(), // Subscription price
  currency: text("currency").notNull(), // Subscription currency
  billingCycle: billingCycleEnum("billing_cycle").notNull(), // Billing cycle
  billingCount: integer("billing_count").notNull().default(1), // Billing count
  billingType: integer("billing_type").notNull().default(1), // Billing type  1-main plan，3-onetime
  externalId: text("external_id").notNull().default(""), // Subscription name
  externalCheckoutUrl: text("external_checkout_url").notNull().default(""), // External checkout url
  isActive: boolean("is_active").notNull().default(true), // Whether enabled
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(), // Record creation time
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last record update time
});

export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlans>;
export type NewSubscriptionPlan = InferInsertModel<typeof subscriptionPlans>;
