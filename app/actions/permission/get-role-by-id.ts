'use server';

import { getTranslations } from 'next-intl/server';

import { supabaseAuthProvider } from '@/lib/auth/providers/supabase.provider';
import { withPermission } from '@/lib/permission/guards/action';
import { AppError } from '@/lib/types/app.error';
import { RoleQuery } from '@/lib/db/crud/permission/role.query';
import { RoleMapper } from '@/lib/mappers/permission/role';
import { RoleDto } from '@/lib/types/permission/role.dto';  

/** 
 * Get a single role by ID
 * @param roleId Role ID
 * @returns Role information
 * @throws AppError if role doesn't exist, roleId is invalid, or query fails
 */
export const getRoleById = withPermission("getRoleById", async (roleId: string): Promise<RoleDto> => {
  const t = await getTranslations('PermissionGetRoleById');
  const { user, error: authError } = await supabaseAuthProvider.getUser();
  if (authError || !user) {
    throw new AppError("AUTHENTICATION_ERROR", t('userNotAuthenticated'));
  }

  if (!roleId || typeof roleId !== 'string') {
    throw new AppError("INVALID_INPUT", t('invalidRoleIdProvided'));
  }

  try {
    const role = await RoleQuery.getById(roleId);

    if (!role) {
      throw new AppError("NOT_FOUND", t('roleNotFound', { roleId }));
    }

    return RoleMapper.toDTO(role);
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error(`failedToRetrieveRole (Role ID: ${roleId}):`, error);
    throw new AppError("DATABASE_ERROR", t('failedToRetrieveRole', { roleId }));
  }
});