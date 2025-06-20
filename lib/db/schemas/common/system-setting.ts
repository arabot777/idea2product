import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * System Settings Table
 * Used to store system-level configuration items
 */
export const systemSettings = pgTable("system_settings", {
  // Configuration item ID
  id: uuid("id").primaryKey().defaultRandom(),

  // Configuration key, unique identifier
  key: text("key").notNull().unique(),

  // Configuration value, stored as JSON string
  value: text("value"),

  // Configuration description
  description: text("description"),

  // Creation time
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Update time
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System settings table relationships
export const systemSettingsRelations = relations(systemSettings, () => ({
  // Define relationships with other tables here
}));

// Type exports
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
