"use server";

import { withPermission } from "@/lib/permission/guards/action";
import { PermissionConfigQuery } from "@/lib/db/crud/permission/permission-config.query";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";
import { AppError } from "@/lib/types/app.error";
import { PermissionConfigDto } from "@/lib/types/permission/permission-config.dto";
import { getTranslations } from 'next-intl/server';

export const getAllPermissionConfigs = withPermission(
  "getAllPermissionConfigs",
  async (): Promise<{ data: PermissionConfigDto[]; }> => {
    const t = await getTranslations('PermissionGetAllPermissionConfigs');
    try {
      // Note: The current PermissionConfigQuery.getAll() does not support pagination, filtering, or sorting.
      // This implementation assumes these capabilities will be added to the query layer.
      // For now, we fetch all and apply client-side logic.
      const permissionConfigs = await PermissionConfigQuery.getAll();

      // Map database results to DTOs
      const dtos = PermissionConfigMapper.toDTOList(permissionConfigs);

      return {
        data: dtos,
      };
    } catch (error) {
      console.error('errorFetchingAllPermissionConfigs', error);
      // Return empty array instead of throwing an error for query exceptions
      if (error instanceof AppError) {
        // Handle specific AppError types if necessary, otherwise rethrow or log
        return {
          data: [],
        };
      }
      return {
        data: [],
      };
    }
  }
);

