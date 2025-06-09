import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@/lib/db/drizzle";
import { permissionConfigs, PermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { eq, inArray } from "drizzle-orm";
import {
  AuthStatusType,
  ActiveStatusType,
  RejectActionType,
  PermissionScopeType,
  AuthStatus,
  ActiveStatus,
  RejectAction,
  PermissionScope,
  PermissionConfigDto,
} from "@/lib/types/permission/permission-config.dto";

import type {
  PermissionFileConfig,
  PermissionsFileMap,
  PermissionDetail,
  PermissionDiff,
  MergedPermissionFileConfig,
} from "@/lib/types/permission/permission-config.bean";
import { PermissionError } from "@/lib/types/permission/permission-config.bean";
import { PermissionConfigMapper } from "@/lib/mappers/permission/permission-config";

/**
 * Permission Sync Service
 * Responsible for comparing and synchronizing file configurations with database configurations
 */
export class PermissionSyncService {
  /**
   * Load the merged permission configuration file
   */
  private loadMergedConfig(): MergedPermissionFileConfig {
    try {
      const configPath = join(process.cwd(), "config/permission.merge.json");
      const content = readFileSync(configPath, "utf-8");
      return JSON.parse(content) as MergedPermissionFileConfig;
    } catch (error) {
      throw new PermissionError("Unable to read merged permission configuration file", {
        error,
        configPath: join(process.cwd(), "config/permission.merge.json"),
      });
    }
  }

  /**
   * Convert permission configuration to database format
   */
  private convertToDbFormat(mergedConfig: MergedPermissionFileConfig): Partial<PermissionConfigDto>[] {
    const configs: Partial<PermissionConfigDto>[] = [];

    // Process page permissions
    if (mergedConfig.permissions.page) {
      Object.entries(mergedConfig.permissions.page).forEach(([target, config]) => {
        configs.push({
          key: `${PermissionScope.PAGE}@${target}`,
          target,
          scope: PermissionScope.PAGE,
          auth_status: config.authStatus,
          active_status: config.activeStatus || ActiveStatus.INACTIVE,
          subscription_types: config.subscription || [],
          reject_action: config.rejectAction || RejectAction.REDIRECT,
          title: config.title || `${PermissionScope.PAGE}:${target}`,
          description: config.description || "",
        });
      });
    }

    // Process API permissions
    if (mergedConfig.permissions.api) {
      Object.entries(mergedConfig.permissions.api).forEach(([target, config]) => {
        configs.push({
          key: `${PermissionScope.API}@${target}`,
          target,
          scope: PermissionScope.API,
          auth_status: config.authStatus,
          active_status: config.activeStatus || ActiveStatus.INACTIVE,
          subscription_types: config.subscription || [],
          reject_action: config.rejectAction || RejectAction.THROW,
          title: config.title || `${PermissionScope.API}:${target}`,
          description: config.description || "",
        });
      });
    }

    // Process action permissions
    if (mergedConfig.permissions.action) {
      Object.entries(mergedConfig.permissions.action).forEach(([target, config]) => {
        configs.push({
          key: `${PermissionScope.ACTION}@${target}`,
          target,
          scope: PermissionScope.ACTION,
          auth_status: config.authStatus,
          active_status: config.activeStatus || ActiveStatus.INACTIVE,
          subscription_types: config.subscription || [],
          reject_action: config.rejectAction || RejectAction.THROW,
          title: config.title || `${PermissionScope.ACTION}:${target}`,
          description: config.description || "",
        });
      });
    }

    // Process component permissions
    if (mergedConfig.permissions.component) {
      Object.entries(mergedConfig.permissions.component).forEach(([target, config]) => {
        configs.push({
          key: `${PermissionScope.COMPONENT}@${target}`,
          target,
          scope: PermissionScope.COMPONENT,
          auth_status: config.authStatus,
          active_status: config.activeStatus || ActiveStatus.INACTIVE,
          subscription_types: config.subscription || [],
          reject_action: config.rejectAction || RejectAction.HIDE,
          title: config.title || `${PermissionScope.COMPONENT}:${target}`,
          description: config.description || "",
        });
      });
    }

    return configs;
  }

  /**
   * Compare two permission configurations
   */
  private isConfigEqual(fileConfig: Partial<PermissionConfig>, dbConfig: PermissionConfig): boolean {
    const normalizeArray = (arr?: string[] | null): string[] => {
      return (arr || []).sort();
    };
    return (
      fileConfig.auth_status === dbConfig.auth_status &&
      fileConfig.active_status === dbConfig.active_status &&
      JSON.stringify(normalizeArray(fileConfig.subscription_types)) === JSON.stringify(normalizeArray(dbConfig.subscription_types)) &&
      fileConfig.reject_action === dbConfig.reject_action &&
      fileConfig.target === dbConfig.target &&
      fileConfig.scope === dbConfig.scope &&
      fileConfig.title === dbConfig.title &&
      fileConfig.description === dbConfig.description
    );
  }

  /**
   * Get permission configuration differences
   */
  public async getPermissionDiffs(): Promise<PermissionDiff[]> {
    try {
      // Read file configuration
      const mergedConfig = this.loadMergedConfig();
      const fileConfigs = this.convertToDbFormat(mergedConfig);
      const fileConfigMap = new Map(fileConfigs.map((config) => [config.key!, config]));

      // Read database configuration
      const dbConfigs = await db.select().from(permissionConfigs);
      const dbConfigMap = new Map(dbConfigs.map((config) => [config.key, config]));

      const diffs: PermissionDiff[] = [];

      // Check file configuration
      for (const [key, fileConfig] of fileConfigMap.entries()) {
        const dbConfig = dbConfigMap.get(key);

        if (!key) continue;

        if (!dbConfig) {
          // New configuration
          diffs.push({
            key,
            status: "new",
            fileConfig: fileConfig,
          });
        } else if (this.isConfigEqual(fileConfig, dbConfig)) {
          fileConfig.id = dbConfig.id;
          // Configuration consistent
          diffs.push({
            key,
            status: "consistent",
            fileConfig: fileConfig,
            dbConfig: PermissionConfigMapper.toDTO(dbConfig),
          });
        } else {
          fileConfig.id = dbConfig.id;
          // Configuration updated
          diffs.push({
            key,
            status: "updated",
            fileConfig: fileConfig,
            dbConfig: PermissionConfigMapper.toDTO(dbConfig),
          });
        }
      }

      // Check deleted configuration in database
      for (const [key, dbConfig] of dbConfigMap.entries()) {
        if (!fileConfigMap.has(key)) {
          diffs.push({
            key,
            status: "deleted",
            dbConfig: PermissionConfigMapper.toDTO(dbConfig),
          });
        }
      }

      return diffs.sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      throw new PermissionError("Failed to get permission config differences", { error });
    }
  }

  /**
   * Synchronize permission configurations to database
   */
  public async syncPermissions(diffs: PermissionDiff[]): Promise<void> {
    try {
      const toInsert: Partial<PermissionConfig>[] = [];
      const toUpdate: { id: string; config: Partial<PermissionConfig> }[] = [];
      const toDelete: string[] = [];

      for (const diff of diffs) {
        switch (diff.status) {
          case "new":
            if (diff.fileConfig) {
              toInsert.push(diff.fileConfig);
            }
            break;

          case "updated":
            if (diff.fileConfig && diff.dbConfig) {
              toUpdate.push({
                id: diff.dbConfig.id || "",
                config: diff.fileConfig,
              });
            }
            break;

          case "deleted":
            if (diff.dbConfig) {
              toDelete.push(diff.dbConfig.id || "");
            }
            break;
        }
      }

      // Execute database operations
      await db.transaction(async (tx) => {
        try {
          // Insert new configurations
          if (toInsert.length > 0) {
            await tx.insert(permissionConfigs).values(toInsert as any); // Temporarily use any to solve type problem
          }

          // Update configurations
          for (const { id, config } of toUpdate) {
            await tx
              .update(permissionConfigs)
              .set(config as any) // Temporarily use any to solve type problem
              .where(eq(permissionConfigs.id, id));
          }

          // Delete configurations
          if (toDelete.length > 0) {
            await tx.delete(permissionConfigs).where(inArray(permissionConfigs.id, toDelete));
          }
        } catch (error) {
          throw new PermissionError("Failed to sync permissions to database", { error });
        }
      });

      console.log(`✅ Permission sync completed:
        New ${toInsert.length} configs
        Updated ${toUpdate.length} configs
        Deleted ${toDelete.length} configs
      `);
    } catch (error) {
      throw new PermissionError("Failed to sync permissions to database", { error });
    }
  }
}

// Export singleton instance
export const permissionSyncService = new PermissionSyncService();
