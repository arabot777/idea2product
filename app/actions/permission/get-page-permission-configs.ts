"use server";

import { getTranslations } from 'next-intl/server';

import { withPermission } from "@/lib/permission/guards/action";
import { PermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { PermissionConfigQuery } from "@/lib/db/crud/permission/permission-config.query";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";
import { AppError } from "@/lib/types/app.error";
import { PermissionConfigDto } from "@/lib/types/permission/permission-config.dto";
import { PageParams } from "@/utils/drizzle.page";

export const getPagePermissionConfigs = withPermission(
  "getPagePermissionConfigs",
  async (
    params?: PageParams<PermissionConfig>
  ): Promise<{ data: PermissionConfigDto[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> => {
    try {
      // Note: The current PermissionConfigQuery.getAll() does not support pagination, filtering, or sorting.
      // This implementation assumes these capabilities will be added to the query layer.
      // For now, we fetch all and apply client-side logic.
      const permissionConfigs = await PermissionConfigQuery.getPagination(params || {});

      // Map database results to DTOs
      const dtos = PermissionConfigMapper.toDTOList(permissionConfigs.data);

      return {
        data: dtos,
        total: permissionConfigs.total,
        page: permissionConfigs.page,
        pageSize: permissionConfigs.pageSize,
        totalPages: permissionConfigs.totalPages,
        hasNext: permissionConfigs.hasNext,
        hasPrevious: permissionConfigs.hasPrevious,
      };
    } catch (error) {
      const t = await getTranslations('PermissionGetPagePermissionConfigs');
      console.error('errorFetchingPermissionConfigs', error);
      // Return empty array instead of throwing an error for query exceptions
      if (error instanceof AppError) {
        // Handle specific AppError types if necessary, otherwise rethrow or log
        return {
          data: [],
          total: 0,
          page: 0,
          pageSize: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        };
      }
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }
);

