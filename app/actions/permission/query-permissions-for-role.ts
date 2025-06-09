'use server';

import { supabaseAuthProvider } from '@/lib/auth/providers/supabase.provider';
import { AppError } from '@/lib/types/app.error';
import { RolePermissionQuery } from '@/lib/db/crud/permission/role-permission.query';
import { PermissionConfigQuery } from '@/lib/db/crud/permission/permission-config.query';
import { RoleQuery } from '@/lib/db/crud/permission/role.query';
import { PermissionConfigMapper } from '@/lib/mappers/permission/permission-config';
import { withPermission } from '@/lib/permission/guards/action';
import { PartialPermissionConfigDto } from '@/lib/types/permission/permission-config.dto'; // Assuming PartialPermissionConfigDto is defined or will be defined

import { getTranslations } from 'next-intl/server';

/**
 * Queries all permission associations for a specific role
 * @param roleId Role ID
 * @returns List of permission associations
 */
export const queryPermissionsForRole = withPermission("queryPermissionsForRole", async (roleId: string): Promise<PartialPermissionConfigDto[]> => {
  const t = await getTranslations('PermissionQueryPermissionsForRole');
  try {
    // 1. Authenticate user
    const { user } = await supabaseAuthProvider.getUser();
    if (!user) {
      throw new AppError("PERMISSION_UNAUTHORIZED", t('unauthorizedUserNotLoggedIn'));
    }

    // 2. Validate if the role exists
    const role = await RoleQuery.getById(roleId);
    if (!role) {
      throw new AppError("PERMISSION_ROLE_NOT_FOUND", t('roleNotFound'));
    }

    // 3. Query all permissions associated with the role
    const rolePermissionsDb = await RolePermissionQuery.getRolePermissionsByRoleId(roleId);

    if (!rolePermissionsDb || rolePermissionsDb.length === 0) {
      return [];
    }

    // 4. Get IDs of all permission configurations
    const permissionIds = rolePermissionsDb.map((rp: { permissionId: string }) => rp.permissionId);

    // 5. Query specific permission configurations by permission ID
    const dbPermissions = await PermissionConfigQuery.getByIds(permissionIds);

    // 6. Use mapper to convert query results to application layer objects
    // PartialPermissionConfigDto is used here, assuming PermissionConfigMapper.toDTOList can handle and return Partial type
    return PermissionConfigMapper.toDTOList(dbPermissions);

  } catch (error: any) {
    console.error(`queryRolePermissionsFailed (Role ID: ${roleId}):`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("PERMISSION_QUERY_FOR_ROLE_FAILED", error.message || t('queryRolePermissionsFailed'), error);
  }
});