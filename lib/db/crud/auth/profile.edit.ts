import { db } from "../../drizzle";
import { profiles, NewProfile } from "../../schemas/auth/profile";
import { eq } from "drizzle-orm";

export class ProfileEdit {
  static async create(newProfile: NewProfile) {
    return db.insert(profiles).values(newProfile).returning();
  }

  static async update(id: string, updatedProfile: Partial<NewProfile>) {
    return db.update(profiles).set(updatedProfile).where(eq(profiles.id, id)).returning();
  }

  static async delete(id: string) {
    return db.delete(profiles).where(eq(profiles.id, id)).returning();
  }
}