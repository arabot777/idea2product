"use server";

import { getTranslations } from 'next-intl/server';

import { db } from "@/lib/db/drizzle";
import { roles, NewRole } from "@/lib/db/schemas/permission/role";
import { AppError } from "@/lib/types/app.error";
import { withPermission } from "@/lib/permission/guards/action";
import { RoleEdit } from "@/lib/db/crud/permission/role.edit";
import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";

/**
 * Create a new role
 * @param roleData Role data
 * @returns Created role
 */
async function createRoleHandler(roleData: NewRole) {
  const t = await getTranslations('PermissionCreateRole');
  try {
    const [newRole] = await RoleEdit.create(roleData);
    if (!newRole) {
      throw new AppError("CREATE_ROLE_FAILED", t('createRoleFailed'));
    }
    return newRole;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("UNKNOWN_ERROR", error.message || t('createRoleFailed'), error);
  }
}

export const createRole = withPermission("createRole", createRoleHandler);
