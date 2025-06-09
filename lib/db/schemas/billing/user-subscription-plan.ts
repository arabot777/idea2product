import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "../auth/profile";
import { subscriptionPlans } from "./subscription-plan";
import { currencyEnum,billingStatusEnum,billingCycleEnum } from "./enum";

export const userSubscriptionPlans = pgTable("user_subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the subscription
  userId: uuid("user_id") // Associated user ID
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  externalId: text("external_id"), // External payment system subscription ID (e.g., Stripe)
  sourceId: uuid("source_id")
    .notNull()
    .references(() => subscriptionPlans.id), // Subscription plan ID
  name: text("name").notNull(), // Subscription name
  description: text("description").notNull(), // Subscription description
  price: doublePrecision("price").notNull(), // Subscription price
  status: billingStatusEnum("status").notNull(), // Subscription status (e.g., active, canceled)
  currentPeriodStart: timestamp("current_period_start").notNull(), // Start time of the current billing period
  currentPeriodEnd: timestamp("current_period_end"), // End time of the current billing period
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false), // Whether to cancel the subscription at the end of the current period
  canceledAt: timestamp("canceled_at"), // Time when the subscription was canceled
  endedAt: timestamp("ended_at"), // Time when the subscription ended
  currency: currencyEnum("currency").notNull(), // Subscription currency
  billingCycle: billingCycleEnum("billing_cycle").notNull(), // Billing cycle
  isActive: boolean("is_active").notNull().default(true), // Whether enabled
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(), // Record creation time
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last record update time
});

export const userSubscriptionPlansRelations = relations(userSubscriptionPlans, ({ one }) => ({
  profile: one(profiles, {
    fields: [userSubscriptionPlans.userId],
    references: [profiles.id],
  }),
  source: one(subscriptionPlans, {
    fields: [userSubscriptionPlans.sourceId],
    references: [subscriptionPlans.id],
  }),
}));

export type UserSubscriptionPlan = typeof userSubscriptionPlans.$inferSelect;
export type NewUserSubscriptionPlan = typeof userSubscriptionPlans.$inferInsert;
