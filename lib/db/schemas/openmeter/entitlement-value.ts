import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { profiles } from "../auth/profile";

export const entitlementValues = pgTable(
  "entitlement_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }), // Associated user ID
    featureKey: text("feature_key").notNull(), // Associated feature key
    hasAccess: boolean("has_access").notNull(), // Whether access is granted
    balance: doublePrecision("balance").notNull(), // Balance
    usage: doublePrecision("usage").notNull(), // Usage amount
    overage: doublePrecision("overage").notNull(), // Overage amount
    lastCheckedAt: timestamp("last_checked_at").notNull().defaultNow(), // Last checked time
    checkFlag: boolean("check_flag").notNull().default(false), // Check flag
    lowBalanceMode: boolean("low_balance_mode").notNull().default(false), // Low balance mode flag
    createdAt: timestamp("created_at").notNull().defaultNow(), // Creation time
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Update time
  },
  (table) => [index("entitlement_values_user_id_idx").on(table.userId), index("entitlement_values_feature_key_idx").on(table.featureKey)]
);

export type EntitlementValue = typeof entitlementValues.$inferSelect;
export type NewEntitlementValue = typeof entitlementValues.$inferInsert;
