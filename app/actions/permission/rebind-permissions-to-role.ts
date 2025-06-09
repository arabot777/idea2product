"use server";

import { getTranslations } from 'next-intl/server';

import { AppError } from "@/lib/types/app.error";
import { withPermission } from "@/lib/permission/guards/action";
import { RolePermissionEdit } from "@/lib/db/crud/permission/role-permission.edit";
import { RolePermissionMapper } from "@/lib/mappers/permission/role-permission";
import { NewRolePermission } from "@/lib/db/schemas/permission/role-permission";
import { z } from "zod";
import { permissionRuntimeService } from "@/lib/permission/services/runtime";

// Validation schema for rebinding permissions
/**
 * Rebind one or more permissions to a role
 * @param params Binding parameters
 * @returns Binding result
 */
export const rebindPermissionsToRole = withPermission(
  "rebindPermissionsToRole",
  async (params: { roleId: string; permissionIds: string[] }) => {
    const t = await getTranslations('PermissionRebindPermissionsToRole');

    const rebindPermissionsSchema = z.object({
      roleId: z.string().min(1, t('roleIdRequired')),
      permissionIds: z.array(z.string().uuid(t('permissionIdInvalidUuid'))).min(1, t('atLeastOnePermissionIdRequired')),
    });

    try {
      const validatedParams = rebindPermissionsSchema.safeParse(params);
      if (!validatedParams.success) {
        throw new AppError("PERMISSION_INVALID_PARAMS", t('parameterValidationFailed'));
      }
      const { roleId, permissionIds } = validatedParams.data;

      if (permissionIds.length > 0) {
        const assignments: NewRolePermission[] = permissionIds.map((permissionId) =>
          RolePermissionMapper.fromDTO({
            roleId: roleId,
            permissionId: permissionId,
          })
        );
        await RolePermissionEdit.deleteByRoleId(roleId);
        // Insert each assignment individually as RolePermissionEdit.create accepts a single NewRolePermission
        for (const assignment of assignments) {
          await RolePermissionEdit.create(assignment);
        }
        await permissionRuntimeService.reload();
      }

      return { success: true, data: null };
    } catch (error: any) {
      console.error('failedToBindPermissionsLog', error);
      throw new AppError("PERMISSION_BIND_FAILED", error.message || t('failedToBindPermissions'), error);
    }
  }
);
