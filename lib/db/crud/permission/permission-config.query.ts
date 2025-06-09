import { db } from "@/lib/db/drizzle";
import { permissionConfigs, PermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { eq, inArray } from "drizzle-orm";
import { DrizzlePageUtils, PageParams } from "@/utils/drizzle.page";

export class PermissionConfigQuery {
  static async getAll(): Promise<PermissionConfig[]> {
    return await db.select().from(permissionConfigs);
  }

  static async getById(id: string): Promise<PermissionConfig | undefined> {
    return await db
      .select()
      .from(permissionConfigs)
      .where(eq(permissionConfigs.id, id))
      .limit(1)
      .then((res) => res[0]);
  }

  static async getByKey(key: string): Promise<PermissionConfig | undefined> {
    return await db
      .select()
      .from(permissionConfigs)
      .where(eq(permissionConfigs.key, key))
      .limit(1)
      .then((res) => res[0]);
  }
  static async getByIds(ids: string[]): Promise<PermissionConfig[]> {
    if (ids.length === 0) {
      return [];
    }
    return await db.select().from(permissionConfigs).where(inArray(permissionConfigs.id, ids));
  }

  /**
   * Paginate permission configurations.
   * @param params Pagination parameters.
   * @returns Pagination results.
   */
  static async getPagination(params: PageParams): Promise<{
    data: PermissionConfig[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    return DrizzlePageUtils.pagination<PermissionConfig>(permissionConfigs, params);
  }
}
