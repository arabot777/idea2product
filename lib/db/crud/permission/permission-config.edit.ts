import { db } from "@/lib/db/drizzle";
import { permissionConfigs, NewPermissionConfig } from "@/lib/db/schemas/permission/permission-config";
import { eq } from "drizzle-orm";

export class PermissionConfigEdit {
  static async create(permissionConfig: NewPermissionConfig) {
    return await db.insert(permissionConfigs).values(permissionConfig).returning();
  }

  static async update(id: string, updates: Partial<NewPermissionConfig>) {
    return await db.update(permissionConfigs).set(updates).where(eq(permissionConfigs.id, id)).returning();
  }

  static async delete(id: string) {
    return await db.delete(permissionConfigs).where(eq(permissionConfigs.id, id)).returning();
  }
}