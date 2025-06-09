import { db } from "@/lib/db/drizzle";
import { roles, Role } from "@/lib/db/schemas/permission/role";
import { eq } from "drizzle-orm";

export class RoleQuery {
  static async getAll(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  static async getById(id: string): Promise<Role | undefined> {
    return await db.select().from(roles).where(eq(roles.id, id)).limit(1).then(res => res[0]);
  }

  static async getByName(name: string): Promise<Role | undefined> {
    return await db.select().from(roles).where(eq(roles.name, name)).limit(1).then(res => res[0]);
  }
}