import { db } from "../../drizzle";
import { systemSettings, NewSystemSetting } from "../../schemas/common/system-setting";
import { eq, and } from "drizzle-orm";

export class SystemSettingEdit {
  /**
   * Create a new system setting
   */
  static async create(newSetting: NewSystemSetting) {
    return db.insert(systemSettings).values(newSetting).returning();
  }

  /**
   * Update an existing system setting by ID
   */
  static async update(id: string, updatedSetting: Partial<NewSystemSetting>) {
    return db
      .update(systemSettings)
      .set({
        ...updatedSetting,
        updatedAt: new Date()
      })
      .where(eq(systemSettings.id, id))
      .returning();
  }

  /**
   * Update a system setting by its key
   */
  static async updateByKey(key: string, updatedSetting: Partial<NewSystemSetting>) {
    return db
      .update(systemSettings)
      .set({
        ...updatedSetting,
        updatedAt: new Date()
      })
      .where(eq(systemSettings.key, key))
      .returning();
  }

  /**
   * Delete a system setting by ID
   */
  static async delete(id: string) {
    return db.delete(systemSettings).where(eq(systemSettings.id, id)).returning();
  }

  /**
   * Delete a system setting by its key
   */
  static async deleteByKey(key: string) {
    return db.delete(systemSettings).where(eq(systemSettings.key, key)).returning();
  }

  /**
   * Upsert a system setting (create or update by key)
   */
  static async upsert(setting: NewSystemSetting) {
    return db
      .insert(systemSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: setting.value,
          description: setting.description,
          updatedAt: new Date()
        }
      })
      .returning();
  }
}
