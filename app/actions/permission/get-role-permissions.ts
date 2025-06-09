"use server";

import { getTranslations } from 'next-intl/server';

import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";
import { AppError } from "@/lib/types/app.error";
import { RolePermissionQuery } from "@/lib/db/crud/permission/role-permission.query";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";
import { withPermission } from "@/lib/permission/guards/action";
import { PermissionConfigDto } from "@/lib/types/permission/permission-config.dto";
import { RoleQuery } from "@/lib/db/crud/permission/role.query"; // Import RoleQuery to check if role exists
import { PermissionConfigQuery } from "@/lib/db/crud/permission/permission-config.query";

export const getRolePermissions = withPermission("getRolePermissions", async (roleName: string): Promise<PermissionConfigDto[]> => {
  const t = await getTranslations('PermissionGetRolePermissions');
  try {
    // 1. Validate if the role exists
    const role = await RoleQuery.getByName(roleName);
    if (!role) {
      throw new AppError("PERMISSION_ROLE_NOT_FOUND", t('roleNotFound'));
    }

    // 2. Query all permissions associated with the role
    // RolePermissionQuery.getByRoleId returns an array of RolePermission, further PermissionConfig is needed
    const rolePermissionsDb = await RolePermissionQuery.getRolePermissionsByRoleId(role.id);

    if (!rolePermissionsDb || rolePermissionsDb.length === 0) {
      // Handle cases where permissions are empty
      return [];
    }

    const permissionIds = rolePermissionsDb.map((rp: { permissionId: string }) => rp.permissionId);

    const dbPermissions = await PermissionConfigQuery.getByIds(permissionIds);

    // 5. Use mapper to convert query results to application layer objects
    return PermissionConfigMapper.toDTOList(dbPermissions);
  } catch (error: any) {
    console.error(`Failed to get role permissions (Role: ${roleName}):`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("PERMISSION_GET_ROLE_PERMISSIONS_FAILED", error.message || t('getRolePermissionsFailed'), error);
  }
});
