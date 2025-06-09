import { db } from "@/lib/db/drizzle";
import { permissionConfigs } from "@/lib/db/schemas/permission/permission-config";
import { rolePermissions } from "@/lib/db/schemas/permission/role-permission";
import { roles } from "@/lib/db/schemas/permission/role";
import { eq } from "drizzle-orm";
import {
  AuthStatusType,
  ActiveStatusType,
  RejectActionType,
  PermissionScopeType,
  AuthStatus,
  ActiveStatus,
  RejectAction,
  PermissionScope,
} from "@/lib/types/permission/permission-config.dto";

import type { PermissionCheckResult, RuntimePermission } from "@/lib/types/permission/permission-config.bean";
import { PermissionError } from "@/lib/types/permission/permission-config.bean";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";

/**
 * Permission Runtime Service
 * Responsible for loading, caching, and validating permission configurations
 */
export class PermissionRuntimeService {
  private permissions: Map<string, RuntimePermission> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Initialize the service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    try {
      this.initPromise = this._loadPermissions();
      await this.initPromise;
      this.isInitialized = true;
    } catch (error) {
      this.initPromise = null;
      throw new PermissionError("Failed to initialize permissions", { error });
    }
  }

  /**
   * Find the best matching route and extract parameters
   */
  public async findBestMatchingRoute(
    scope: PermissionScopeType,
    requestPath: string,
    requestMethod?: string,
  ): Promise<string | null> {
    await this.initialize();

    // 1. Normalize the request path
    let normalizedRequestPath = requestPath.toLowerCase();
    if (!normalizedRequestPath.startsWith('/')) {
      normalizedRequestPath = '/' + normalizedRequestPath;
    }
    // Remove trailing slash unless the path is "/"
    if (normalizedRequestPath !== '/' && normalizedRequestPath.endsWith('/')) {
      normalizedRequestPath = normalizedRequestPath.slice(0, -1);
    }
    // Split the path into segments; root path "/" corresponds to an empty array
    const requestPathSegments = normalizedRequestPath === '/' ? [] : normalizedRequestPath.split('/').filter(s => s.length > 0);

    // 2. Prepare variables for matching
    let exactMatchKey: string | null = null;
    let bestParameterizedMatch: { key: string; staticScore: number } | null = null;
    let bestParentMatch: { key: string; pathLength: number } | null = null;

    const allConfiguredRouteKeys = Array.from(this.permissions.keys());

    // 3. Iterate through all configured permission keys
    for (const configuredKey of allConfiguredRouteKeys) {
      const parts = configuredKey.split('@');
      if (parts.length < 2) continue; // Invalid format

      const configuredScope = parts[0] as PermissionScopeType;
      if (configuredScope !== scope) {
        continue; // Scope mismatch
      }

      let configuredPath: string;
      let configuredMethod: string | undefined;

      if (configuredScope === PermissionScope.PAGE) {
        if (parts.length !== 2) continue; // PAGE@path
        configuredPath = parts[1];
      } else { // API scope
        if (parts.length !== 3) continue; // API@METHOD@path
        configuredMethod = parts[1].toUpperCase();
        if (requestMethod && configuredMethod !== requestMethod.toUpperCase()) {
          continue; // API method mismatch
        }
        configuredPath = parts[2];
      }

      // Normalize the configured path
      let normalizedConfiguredPath = configuredPath.toLowerCase();
      if (!normalizedConfiguredPath.startsWith('/')) {
        normalizedConfiguredPath = '/' + normalizedConfiguredPath;
      }
      if (normalizedConfiguredPath !== '/' && normalizedConfiguredPath.endsWith('/')) {
        normalizedConfiguredPath = normalizedConfiguredPath.slice(0, -1);
      }
      const configuredPathSegments = normalizedConfiguredPath === '/' ? [] : normalizedConfiguredPath.split('/').filter(s => s.length > 0);

      // --- Start matching logic ---

      // Rule 1: Exact match
      if (normalizedConfiguredPath === normalizedRequestPath) {
        // Ensure method also matches (for API Scope)
        if (configuredScope === PermissionScope.API) {
          if (requestMethod && configuredMethod === requestMethod.toUpperCase()) {
            exactMatchKey = configuredKey;
            break; // Exact match is highest priority, break loop
          }
        } else { // PAGE Scope
          exactMatchKey = configuredKey;
          break; // Exact match is highest priority
        }
      }

      // Rule 2: Parameterized path match
      if (configuredPathSegments.length === requestPathSegments.length && configuredPathSegments.length > 0) { // Ensure not parameterizing root path (unless root path itself has parameters, which is uncommon)
        let isMatch = true;
        let currentStaticScore = 0;
        for (let i = 0; i < configuredPathSegments.length; i++) {
          if (configuredPathSegments[i].startsWith(':')) {
            // This is a parameter segment, it matches
          } else if (configuredPathSegments[i] === requestPathSegments[i]) {
            currentStaticScore++; // Static segment match
          } else {
            isMatch = false; // Static segment mismatch
            break;
          }
        }

        if (isMatch) {
          if (!bestParameterizedMatch || currentStaticScore > bestParameterizedMatch.staticScore) {
            bestParameterizedMatch = { key: configuredKey, staticScore: currentStaticScore };
          }
        }
      }

      // Rule 3: Parent path match
      // Configured path is a parent of the request path, and all segments of the configured path are static
      if (configuredPathSegments.length < requestPathSegments.length && configuredPathSegments.length >= 0) { // Allow empty configured path (root path "/") as parent path
        let isParentMatch = true;
        // All segments of the parent path must be static and match the prefix of the request path
        for (let i = 0; i < configuredPathSegments.length; i++) {
          if (configuredPathSegments[i].startsWith(':')) { // Parent path segment cannot be a parameter
            isParentMatch = false;
            break;
          }
          if (configuredPathSegments[i] !== requestPathSegments[i]) {
            isParentMatch = false;
            break;
          }
        }
        // Handle root path as parent: configuredPathSegments is empty, requestPathSegments is not empty
        if (configuredPathSegments.length === 0 && requestPathSegments.length > 0) {
             // isParentMatch defaults to true, no extra action needed here, an empty array is a prefix of any non-empty array
        }


        if (isParentMatch) {
          if (!bestParentMatch || configuredPathSegments.length > bestParentMatch.pathLength) {
            bestParentMatch = { key: configuredKey, pathLength: configuredPathSegments.length };
          }
        }
      }
    } // End iterating through all configured permission keys

    // 4. Return the best match based on priority
    if (exactMatchKey) {
      return exactMatchKey;
    }
    if (bestParameterizedMatch) {
      return bestParameterizedMatch.key;
    }
    if (bestParentMatch) {
      return bestParentMatch.key;
    }

    return null; // No match found
  }

  /**
   * Load data from cache
   */
  private async _loadFromCache(): Promise<Map<string, RuntimePermission> | null> {
    try {
      const cached: string | null | undefined = await cache.get(CacheKeys.PERMISSION_RUNTIME);
      if (cached) {
        return new Map(JSON.parse(cached));
      }
    } catch (error) {
      console.warn("⚠️ Failed to load permission config from cache:", error);
    }

    return null;
  }
  /**
   * Save permission data to cache
   */
  private async _saveToCache(permissions: Map<string, RuntimePermission>): Promise<void> {
    try {
      await cache.set(CacheKeys.PERMISSION_RUNTIME, JSON.stringify(Array.from(permissions.entries())));
    } catch (error) {
      console.warn("⚠️ Failed to save permission config to cache:", error);
    }
  }

  /**
   * Load permission configurations from database
   */
  private async _loadPermissions(): Promise<void> {
    try {
      // Try loading from cache first
      const cached = await this._loadFromCache();
      if (cached) {
        this.permissions = cached;
        console.log("✅ Loaded permission config from cache");
        return;
      }

      // Load from database
      const allPermissions = await db.select().from(permissionConfigs);
      const allRolePermissions = await db.select().from(rolePermissions);
      const allRoles = await db.select().from(roles);
      const roleMap = new Map<string, string>();
      for (const r of allRoles) {
        roleMap.set(r.id, r.name);
      }

      const rolePermMap = new Map<string, string[]>();
      for (const p of allRolePermissions) {
        if (!rolePermMap.has(p.permissionId)) {
          rolePermMap.set(p.permissionId, []);
        }
        if (roleMap.has(p.roleId)) {
          rolePermMap.get(p.permissionId)?.push(roleMap.get(p.roleId) || "");
        }
      }

      const runtimePermissions = new Map<string, RuntimePermission>();
      for (const p of allPermissions) {
        runtimePermissions.set(p.key, {
          roles: rolePermMap.get(p.id) || [],
          authStatus: (p.auth_status as AuthStatusType) || AuthStatus.ANONYMOUS,
          activeStatus: (p.active_status as ActiveStatusType) || ActiveStatus.INACTIVE,
          subscription: p.subscription_types || [],
          rejectAction: (p.reject_action as RejectActionType) || RejectAction.REDIRECT,
        });
      }

      this.permissions = runtimePermissions;
      await this._saveToCache(runtimePermissions);

      console.log(`✅ Permission runtime loaded: ${this.permissions.size} permission configs`);
    } catch (error) {
      throw new PermissionError("Failed to load permission configurations", { error });
    }
  }
  /**
   * Clear permission cache
   */
  public async clearCache(): Promise<void> {
    this.permissions.clear();
    this.isInitialized = false;
    this.initPromise = null;

    await cache.del(CacheKeys.PERMISSION_RUNTIME);

    console.log("🗑️  Permission cache cleared");
  }

  /**
   * Reload all permission configurations
   */
  public async reload(): Promise<void> {
    await this.clearCache();
    await this.initialize();
  }

  /**
   * Check permission for a given key and user context
   */
  public async checkPermission(key: string, userContext: UserContext): Promise<PermissionCheckResult> {
    try {
      await this.initialize();
      const permission = this.permissions.get(key);
      if (!permission) {
        return {
          allowed: true,
        };
      }

      // Check authentication status
      if (permission.authStatus === "authenticated" && userContext.authStatus !== "authenticated") {
        return {
          allowed: false,
          reason: "Authentication required",
          rejectAction: permission.rejectAction,
        };
      }

      // Check active status
      const activeStatusOrder = ["inactive", "active", "active_2fa"];
      const requiredLevel = activeStatusOrder.indexOf(permission.activeStatus);
      const userLevel = activeStatusOrder.indexOf(userContext.activeStatus);

      if (userLevel < requiredLevel) {
        return {
          allowed: false,
          reason: "Account activation required",
          rejectAction: permission.rejectAction,
        };
      }

      // Check role permissions
      if (permission.roles.length > 0) {
        const hasRequiredRole = permission.roles.some((role) => userContext.roles.includes(role));

        if (!hasRequiredRole) {
          return {
            allowed: false,
            reason: "Insufficient role permissions",
            rejectAction: permission.rejectAction,
          };
        }
      }

      // Check subscription status
      if (permission.subscription.length > 0) {
        const userSubscriptions = userContext.subscription || [];
        const hasRequiredSubscription = permission.subscription.some((sub) => userSubscriptions.includes(sub));

        if (!hasRequiredSubscription) {
          return {
            allowed: false,
            reason: "Required subscription not found",
            rejectAction: permission.rejectAction,
          };
        }
      }
      return {
        allowed: true,
      };
    } catch (error) {
      throw new PermissionError("Permission check failed", {
        error,
        key,
        userContext,
      });
    }
  }

  /**
   * Get all permission configurations
   */
  public async getAllPermissions(): Promise<RuntimePermission[]> {
    await this.initialize();
    return Array.from(this.permissions.values());
  }

  /**
   * Get permission list by scope
   */
  public async getComponentPermissionsByScope(): Promise<RuntimePermission[]> {
    await this.initialize();

    const scopePrefix = `${PermissionScope.COMPONENT}@`;
    return Array.from(this.permissions.entries())
      .filter(([key]) => key.startsWith(scopePrefix))
      .map(([_, permission]) => permission);
  }
}

// Export singleton instance
export const permissionRuntimeService = new PermissionRuntimeService();
