import { db } from "@/lib/db/drizzle";
import { userPremiumPackages, userPremiumPackagesRelations, UserPremiumPackage } from "@/lib/db/schemas/billing/user-premium-package";
import { eq } from "drizzle-orm";

export class UserPremiumPackageQuery {
  static async getById(id: string): Promise<UserPremiumPackage | null> {
    const [userPremiumPackage] = await db.select().from(userPremiumPackages).where(eq(userPremiumPackages.id, id)).limit(1);
    return userPremiumPackage || null;
  }

  static async getAll(): Promise<UserPremiumPackage[]> {
    const allUserPremiumPackages = await db.select().from(userPremiumPackages);
    return allUserPremiumPackages;
  }
}