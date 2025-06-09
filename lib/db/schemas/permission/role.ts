import { pgTable, text, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rolePermissions } from "./role-permission";
import { RoleType } from "@/lib/types/permission/role.dto";


// Role type enum
export const roleTypeEnum = pgEnum("role_type", Object.values(RoleType) as [string, ...string[]]);

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(), // e.g., 'admin', 'editor', 'viewer', 'owner', 'member'
  role_type: roleTypeEnum("role_type").notNull().default("user"), // Role type
  description: text("description"),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export { RoleType };