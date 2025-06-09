import { db } from "@/lib/db/drizzle";
import { rolePermissions, NewRolePermission } from "@/lib/db/schemas/permission/role-permission";
import { eq, and } from "drizzle-orm";

export class RolePermissionEdit {
  static async create(rolePermission: NewRolePermission) {
    return await db.insert(rolePermissions).values(rolePermission).returning();
  }

  static async delete(roleId: string, permissionId: string) {
    return await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)))
      .returning();
  }

  static async deleteByRoleId(roleId: string) {
    return await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId)).returning();
  }

  static async deleteByPermissionId(permissionId: string) {
    return await db.delete(rolePermissions).where(eq(rolePermissions.permissionId, permissionId)).returning();
  }
}
