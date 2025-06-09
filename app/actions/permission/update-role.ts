"use server";

import { getTranslations } from 'next-intl/server';

import { db } from "@/lib/db/drizzle";
import { roles, Role } from "@/lib/db/schemas/permission/role";
import { eq } from "drizzle-orm";
import { AppError } from "@/lib/types/app.error";
import { withPermission } from "@/lib/permission/guards/action";
import { RoleEdit } from "@/lib/db/crud/permission/role.edit";
/**
 * Update a role
 * @param identifier Role ID or name
 * @param updates Content to update
 * @returns Update result
 */
async function updateRoleHandler(identifier: Partial<{ id: string; name: string }>, updates: Partial<Role>): Promise<void> {
  let roleId: string | undefined;
  if (identifier.id) {
    roleId = identifier.id;
  } else if (identifier.name) {
    const [role] = await db.select().from(roles).where(eq(roles.name, identifier.name));
    const t = await getTranslations('PermissionUpdateRole');
    if (!role) {
      throw new AppError("ROLE_NOT_FOUND", t('roleNotFound'));
    }
    roleId = role.id;
  }

  if (!roleId) {
    const t = await getTranslations('PermissionUpdateRole');
    throw new AppError("INVALID_INPUT", t('unableToDetermineRoleId'));
  }

  try {
    const result = await RoleEdit.update(roleId, updates);
    const t = await getTranslations('PermissionUpdateRole');
    if (result.length === 0) {
      throw new AppError("UPDATE_ROLE_FAILED", t('updateRoleFailed'));
    }
  } catch (error: any) {
    const t = await getTranslations('PermissionUpdateRole');
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("UNKNOWN_ERROR", error.message || t('failedToUpdateRole'), error);
  }
}

export const updateRole = withPermission("updateRole", updateRoleHandler);
