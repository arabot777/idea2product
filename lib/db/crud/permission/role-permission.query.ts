import { db } from "../../drizzle";
import { rolePermissions } from "../../schemas/permission/role-permission";
import { roles, Role } from "../../schemas/permission/role";
import { eq } from "drizzle-orm";

export class RolePermissionQuery {
  static async getRolesByPermissionId(permissionId: string): Promise<Role[]> {
    const result = await db
      .select({
        id: roles.id,
        name: roles.name,
        role_type: roles.role_type,
        description: roles.description,
      })
      .from(rolePermissions)
      .leftJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(rolePermissions.permissionId, permissionId));

    return result.filter((row): row is Role => row.id !== null && row.name !== null && row.role_type !== null);
  }

  static async getRolePermissionsByRoleId(roleId: string) {
    const result = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    return result;
  }
}
