import { db } from "../../drizzle";
import { systemSettings, SystemSetting } from "../../schemas/common/system-setting";
import { eq, and, or, ilike, inArray } from "drizzle-orm";
import { DrizzlePageUtils, PageParams, PaginationResult } from "@/utils/drizzle.page";

export class SystemSettingQuery {
  /**
   * Get system setting by ID
   */
  static async getById(id: string): Promise<SystemSetting | undefined> {
    return db.query.systemSettings.findFirst({
      where: eq(systemSettings.id, id)
    });
  }

  /**
   * Get system setting by key
   */
  static async getByKey(key: string): Promise<SystemSetting | undefined> {
    return db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, key)
    });
  }

  /**
   * Get all system settings
   */
  static async getAll(): Promise<SystemSetting[]> {
    return db.query.systemSettings.findMany();
  }

  /**
   * Search system settings by key or description
   */
  static async search(query: string): Promise<SystemSetting[]> {
    return db.query.systemSettings.findMany({
      where: or(
        ilike(systemSettings.key, `%${query}%`),
        ilike(systemSettings.description ?? '', `%${query}%`)
      )
    });
  }

  /**
   * Get paginated system settings
   */
  static async getPagination(params: PageParams): Promise<PaginationResult<SystemSetting>> {
    return DrizzlePageUtils.pagination<SystemSetting>(systemSettings, params);
  }

  /**
   * Get multiple settings by their keys
   */
  static async getByKeys(keys: string[]): Promise<SystemSetting[]> {
    if (keys.length === 0) return [];
    
    return db.query.systemSettings.findMany({
      where: inArray(systemSettings.key, keys)
    });
  }
}