import { db } from "@/lib/db/drizzle";
import { userPremiumPackages, NewUserPremiumPackage, UserPremiumPackage } from "@/lib/db/schemas/billing/user-premium-package";
import { eq } from "drizzle-orm";

export class UserPremiumPackageEdit {
  static async create(data: NewUserPremiumPackage): Promise<UserPremiumPackage> {
    const [newUserPremiumPackage] = await db.insert(userPremiumPackages).values(data).returning();
    return newUserPremiumPackage;
  }

  static async update(id: string, data: Partial<NewUserPremiumPackage>): Promise<UserPremiumPackage | null> {
    const [updatedUserPremiumPackage] = await db.update(userPremiumPackages).set(data).where(eq(userPremiumPackages.id, id)).returning();
    return updatedUserPremiumPackage || null;
  }

  static async delete(id: string): Promise<UserPremiumPackage | null> {
    const [deletedUserPremiumPackage] = await db.delete(userPremiumPackages).where(eq(userPremiumPackages.id, id)).returning();
    return deletedUserPremiumPackage || null;
  }
}