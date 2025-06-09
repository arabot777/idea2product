import { pgTable, uuid, text, timestamp, boolean, jsonb, pgEnum, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "../auth/profile";
import { premiumPackages } from "./premium-package";
import { currencyEnum,billingStatusEnum } from "./enum";

export const userPremiumPackages = pgTable("user_premium_packages", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the premium package
  userId: uuid("user_id") // Associated user ID
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  externalId: text("external_id"), // External payment system premium package ID (e.g., Stripe)
  sourceId: uuid("source_id")
    .notNull()
    .references(() => premiumPackages.id), // Premium package ID
  name: text("name").notNull(), // Premium package name
  description: text("description").notNull(), // Premium package description
  price: doublePrecision("price").notNull(), // Premium package price
  status: billingStatusEnum("status").notNull(), // Premium package status (e.g., active, canceled)
  currentPeriodStart: timestamp("current_period_start").notNull(), // Start time of the current billing period
  currentPeriodEnd: timestamp("current_period_end"), // End time of the current billing period
  canceledAt: timestamp("canceled_at"), // Time when the premium package was canceled
  endedAt: timestamp("ended_at"), // Time when the premium package ended
  currency: currencyEnum("currency").notNull(), // Premium package currency
  isActive: boolean("is_active").notNull().default(true), // Whether enabled
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(), // Record creation time
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last record update time
});

export const userPremiumPackagesRelations = relations(userPremiumPackages, ({ one }) => ({
  profile: one(profiles, {
    fields: [userPremiumPackages.userId],
    references: [profiles.id],
  }),
  source: one(premiumPackages, {
    fields: [userPremiumPackages.sourceId],
    references: [premiumPackages.id],
  }),
}));

export type UserPremiumPackage = typeof userPremiumPackages.$inferSelect;
export type NewUserPremiumPackage = typeof userPremiumPackages.$inferInsert;
