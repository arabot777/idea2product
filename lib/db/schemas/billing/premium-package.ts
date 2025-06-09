import { pgTable, text, timestamp, integer, jsonb, boolean, pgEnum, uuid, doublePrecision } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { currencyEnum } from "./enum";

export const premiumPackages = pgTable("premium_packages", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the subscription
  name: text("name").notNull(), // Subscription name
  description: text("description").notNull(), // Subscription description
  price: doublePrecision("price").notNull(), // Subscription price
  currency: currencyEnum("currency").notNull(), // Subscription currency
  isActive: boolean("is_active").notNull().default(true), // Whether enabled
  metadata: jsonb("metadata"), // Additional metadata
  createdAt: timestamp("created_at").notNull().defaultNow(), // Record creation time
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last record update time
});

export type PremiumPackage = InferSelectModel<typeof premiumPackages>;
export type NewPremiumPackage = InferInsertModel<typeof premiumPackages>;
