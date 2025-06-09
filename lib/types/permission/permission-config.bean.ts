import { z } from "zod";

import { AuthStatusType, ActiveStatusType, RejectActionType, PermissionScopeType ,AuthStatus,ActiveStatus,RejectAction,PermissionScope, PermissionConfigDto } from "./permission-config.dto";

// Base enum types

export const SyncStatus = {
  CONSISTENT: "consistent",
  UPDATED: "updated",
  NEW: "new",
  DELETED: "deleted",
} as const;
// Sync status type
export type SyncStatusType = (typeof SyncStatus)[keyof typeof SyncStatus];

// Base permission detail interface
export interface PermissionDetail {
  title: string;
  description?: string;
  authStatus: AuthStatusType;
  activeStatus?: ActiveStatusType;
  subscription?: string[];
  rejectAction?: RejectActionType;
}

// Permission mapping
export interface PermissionsFileMap {
  page?: Record<string, PermissionDetail>;
  api?: Record<string, PermissionDetail>;
  action?: Record<string, PermissionDetail>;
  component?: Record<string, PermissionDetail>;
}

// Single permission configuration file structure
export interface PermissionFileConfig {
  permissions: PermissionsFileMap;
}

// Merged permission configuration
export interface MergedPermissionFileConfig {
  permissions: PermissionsFileMap;
  generatedAt: string;
  sourceFiles: string[];
  totalConfigs: number;
}

// Permission configuration diff type
export interface PermissionDiff {
  key: string;
  status: SyncStatusType;
  fileConfig?: Partial<PermissionConfigDto> | null;
  dbConfig?: Partial<PermissionConfigDto> | null;
  finalConfig?: Partial<PermissionConfigDto> | null;
}

// Zod Schema Definition
export const basePermissionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  authStatus: z.nativeEnum(AuthStatus).default(AuthStatus.AUTHENTICATED),
  activeStatus: z.nativeEnum(ActiveStatus).optional(),
  subscription: z.array(z.string()).optional(),
  rejectAction: z.nativeEnum(RejectAction).optional(),
});

export const permissionConfigSchema = z.object({
  permissions: z.object({
    page: z.record(basePermissionSchema).optional(),
    api: z.record(basePermissionSchema).optional(),
    action: z.record(basePermissionSchema).optional(),
    component: z.record(basePermissionSchema).optional(),
  }),
});

// Type inference
export type ValidatedPermissionConfig = z.infer<typeof permissionConfigSchema>;

// Export error type
export class PermissionError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * @interface PermissionCheckResult
 * @description Interface for permission check results.
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  rejectAction?: RejectActionType;
}

export interface RuntimePermission {
  roles: string[];
  authStatus: AuthStatusType;
  activeStatus: ActiveStatusType;
  subscription: string[];
  rejectAction: RejectActionType;
}
