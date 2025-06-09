import { db } from "@/lib/db/drizzle";
import { roles, NewRole } from "@/lib/db/schemas/permission/role";
import { eq } from "drizzle-orm";

export class RoleEdit {
  static async create(role: NewRole) {
    return await db.insert(roles).values(role).returning();
  }

  static async update(id: string, updates: Partial<NewRole>) {
    return await db.update(roles).set(updates).where(eq(roles.id, id)).returning();
  }

  static async delete(id: string) {
    return await db.delete(roles).where(eq(roles.id, id)).returning();
  }
}