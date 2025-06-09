"use server";

import { getTranslations } from 'next-intl/server';

import { db } from "@/lib/db/drizzle";
import { PermissionConfigEdit } from "@/lib/db/crud/permission/permission-config.edit";
import { PermissionConfigQuery } from "@/lib/db/crud/permission/permission-config.query";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";
import { AppError } from "@/lib/types/app.error";
import { PermissionDiff } from "@/lib/types/permission/permission-config.bean";
import { PermissionConfigDto } from "@/lib/types/permission/permission-config.dto";
import { NewPermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { withPermission } from "@/lib/permission/guards/action";
import { permissionConfigs } from "@/lib/db/schemas/permission/permission-config";
import { eq } from "drizzle-orm";
import { permissionSyncService } from "@/lib/permission/services/sync";
import { permissionRuntimeService } from "@/lib/permission/services/runtime";

/**
 * Synchronize permission configurations to database
 * @param diffs - List of permission differences
 */
async function syncPermissionsToDatabaseInternal(diffs: PermissionDiff[]): Promise<void> {
  const t = await getTranslations('PermissionSyncPermissionsToDatabase');
  try {
    // Use the existing service to handle the synchronization
    await permissionSyncService.syncPermissions(diffs);

    // Refresh the runtime permission cache after successful sync
    await permissionRuntimeService.reload();
  } catch (error: any) {
    console.error('syncFailedLog', error);
    throw new AppError("PERMISSION_SYNC_FAILED", t('syncFailedError'), error.message);
  }
}

export const syncPermissionsToDatabase = withPermission("syncPermissions", syncPermissionsToDatabaseInternal);
