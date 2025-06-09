"use server";

import { getTranslations } from 'next-intl/server';

import { db } from "@/lib/db/drizzle";
import { roles, Role } from "@/lib/db/schemas/permission/role";
import { rolePermissions } from "@/lib/db/schemas/permission/role-permission";
import { eq } from "drizzle-orm";
import { AppError } from "@/lib/types/app.error";
import { withPermission } from "@/lib/permission/guards/action";
import { RoleEdit } from "@/lib/db/crud/permission/role.edit";
import { permissionRuntimeService } from "@/lib/permission/services/runtime";

/**
 * Delete a role
 * @param identifier Role ID or name
 * @returns Delete result
 */
async function deleteRoleHandler(identifier: Partial<{ id: string; name: string }>): Promise<void> {
  const t = await getTranslations('PermissionDeleteRole');
  await db.transaction(async (tx) => {
    let roleToDelete: Role | undefined;
    if (identifier.id) {
      [roleToDelete] = await tx.select().from(roles).where(eq(roles.id, identifier.id));
    } else if (identifier.name) {
      [roleToDelete] = await tx.select().from(roles).where(eq(roles.name, identifier.name));
    }

    if (!roleToDelete) {
      throw new AppError("ROLE_NOT_FOUND", t('role_not_found'));
    }

    // First delete role-permission associations
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleToDelete.id));
    // Then delete the role
    const result = await RoleEdit.delete(roleToDelete.id);

    if (result.length === 0) {
      throw new AppError("DELETE_ROLE_FAILED", t('delete_role_failed'));
    }

    // 4. Refresh runtime permission cache
    await permissionRuntimeService.reload();
  });
}

export const deleteRole = withPermission("deleteRole", deleteRoleHandler);
