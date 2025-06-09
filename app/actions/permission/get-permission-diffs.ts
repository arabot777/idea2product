"use server";

import { getTranslations } from 'next-intl/server';

import { withPermission } from "@/lib/permission/guards/action";
import { AppError } from "@/lib/types/app.error";
import { PermissionConfigDto } from "@/lib/types/permission/permission-config.dto";
import { PermissionDiff, SyncStatus } from "@/lib/types/permission/permission-config.bean";
import { getAllPermissionConfigs } from "@/app/actions/permission/get-all-permission-configs";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";
import { permissionSyncService } from "@/lib/permission/services/sync";
import { permissionRuntimeService } from "@/lib/permission/services/runtime";

/**
 * Gets the list of permission configuration differences
 */
export const getPermissionDiffs = withPermission("getPermissionDiffs", async (): Promise<PermissionDiff[]> => {
  const t = await getTranslations('PermissionGetPermissionDiffs');
  try {
    const diffs = await permissionSyncService.getPermissionDiffs();

    if (!diffs || diffs.length === 0) {
      return [];
    }

    return diffs;
  } catch (error) {
    console.error('get_permission_diffs_failed', error);
    // Handle exceptions that may occur during comparison, return empty diffs instead of throwing an exception
    if (error instanceof AppError) {
      // More detailed error handling can be performed based on the AppError code
      return [];
    }
    return [];
  }
});
