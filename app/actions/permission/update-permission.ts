"use server";

import { getTranslations } from 'next-intl/server';

import { AppError } from "@/lib/types/app.error";
import { withPermission } from "@/lib/permission/guards/action";
import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";
import { PermissionConfigEdit } from "@/lib/db/crud/permission/permission-config.edit";
import { PermissionConfigQuery } from "@/lib/db/crud/permission/permission-config.query";
import { PermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { permissionRuntimeService } from "@/lib/permission/services/runtime";

/**
 * Handler function to update permission configuration
 * @param id Permission ID
 * @param updates Permission update content
 * @returns Updated permission configuration
 */
async function updatePermissionHandler(id: string, updates: Partial<PermissionConfig>): Promise<PermissionConfig> {
  const t = await getTranslations('PermissionUpdatePermission');
  try {
    // 1. Validate if permission exists
    const existingPermission = await PermissionConfigQuery.getById(id);
    if (!existingPermission) {
      throw new AppError("PERMISSION_NOT_FOUND", t('permission_not_found'));
    }

    // 2. If attempting to update permission key, verify the new key is not duplicate
    if (updates.key && updates.key !== existingPermission.key) {
      throw new AppError("PERMISSION_KEY_DUPLICATE", `${t('permission_key_prefix')}${updates.key}${t('permission_key_suffix')}`);
    }

    // 3. Execute update operation
    const [updatedPermission] = await PermissionConfigEdit.update(id, updates);

    if (!updatedPermission) {
      // Theoretically, if existingPermission exists, update should succeed unless database operation fails
      throw new AppError("UPDATE_PERMISSION_FAILED", t('update_permission_failed_db_error'));
    }

    // 4. Refresh runtime permission cache
    await permissionRuntimeService.reload();

    return updatedPermission;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('failed_to_update_permission_log', error);
    throw new AppError("UNKNOWN_ERROR", error.message || t('failed_to_update_permission_generic'), error);
  }
}

/**
 * Export update permission action with permission guard applied
 */
export const updatePermission = withPermission(
  "updatePermission", // Permission format is "updatePermission"
  updatePermissionHandler
);
