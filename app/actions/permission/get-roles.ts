'use server';

import { getTranslations } from 'next-intl/server';

import { withPermission } from '@/lib/permission/guards/action';
import { RoleQuery } from '@/lib/db/crud/permission/role.query';
import { RoleMapper } from '@/lib/mappers/permission/role';
import { AppError } from '@/lib/types/app.error';
import { RoleDto } from '@/lib/types/permission/role.dto';

/**
 * Get all roles list
 * Supports optional query parameters (like pagination, filtering, etc.)
 * @param params Optional query parameters
 * @returns List of roles
 */
export const getRoles = withPermission(
  "getRoles",
  async (params?: Partial<{ page: number; pageSize: number; name: string }>): Promise<RoleDto[]> => {
    try {
      // Actual query logic, simplified to call getAll directly
      // If pagination and filtering support is needed, RoleQuery.getAll needs to be modified or a new method added
      const roles = await RoleQuery.getAll();
      
      // Use mapper to convert database results to application layer DTO objects
      const roleDtos = RoleMapper.toDTOList(roles);

      return roleDtos;
    } catch (error: any) {
      // Handle query exceptions with AppError
      const t = await getTranslations('PermissionGetRoles');
      console.error('failedToGetRolesListLog', error);
      throw new AppError(
        "PERMISSION_GET_ROLES_FAILED",
        error.message || t('failedToGetRolesList'),
        error
      );
    }
  }
);