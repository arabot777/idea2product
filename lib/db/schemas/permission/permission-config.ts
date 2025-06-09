/**
 * Database model for permission configuration
 * Designed based on the new permission configuration format
 */

import { pgTable, text, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { AuthStatus, ActiveStatus, RejectAction, PermissionScope } from "@/lib/types/permission/permission-config.dto";

// Authentication status enum
export const authStatusEnum = pgEnum("auth_status", Object.values(AuthStatus) as [string, ...string[]]);

// Active status enum
export const activeStatusEnum = pgEnum("active_status", Object.values(ActiveStatus) as [string, ...string[]]);

// Reject action enum
export const rejectActionEnum = pgEnum("reject_action", Object.values(RejectAction) as [string, ...string[]]);

// Permission scope enum
export const permissionScopeEnum = pgEnum("permission_scope", Object.values(PermissionScope) as [string, ...string[]]);

// Permission configuration table
export const permissionConfigs = pgTable("permission_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // Permission key, e.g., 'page:/users/manage', 'api:/api/users/create', 'component:user_edit_button'
  target: text("target").notNull(), // Permission target, e.g., '/users/manage', '/api/users/create', 'user_edit_button'
  scope: permissionScopeEnum("scope").notNull(), // Permission scope: page, api, component
  auth_status: authStatusEnum("auth_status").notNull().default("anonymous"),
  active_status: activeStatusEnum("active_status").notNull().default("inactive"),
  subscription_types: text("subscription_types").array().notNull().default([]), // Array of allowed subscription types
  reject_action: rejectActionEnum("reject_action").notNull().default("redirect"),
  title: text("title"),
  description: text("description"),
});

// Permission configuration relations
export const permissionConfigsRelations = relations(permissionConfigs, ({ many }) => ({}));

// Database model types
export type PermissionConfig = typeof permissionConfigs.$inferSelect;
export type NewPermissionConfig = typeof permissionConfigs.$inferInsert;

// Export enum value objects for convenience
export { AuthStatus, ActiveStatus, RejectAction, PermissionScope };
