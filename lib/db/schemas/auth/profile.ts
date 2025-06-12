import { pgTable, varchar, text, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Supabase auth.users ID (UUID)
  email: text("email").unique().notNull(), // Add email field
  roles: text("roles").array().notNull().default([]),
  username: varchar("username", { length: 50 }).unique(),
  full_name: varchar("full_name", { length: 100 }),
  avatar_url: text("avatar_url"),
  email_verified: boolean("email_verified").notNull().default(false),
  active_2fa: boolean("active_2fa").notNull().default(false),
  subscription: text("subscription").array().notNull().default([]),
  unibeeExternalId: text("unibee_external_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;