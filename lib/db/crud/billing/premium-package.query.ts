import { db } from "@/lib/db/drizzle";
import { premiumPackages, PremiumPackage } from "@/lib/db/schemas/billing/premium-package";
import { eq } from "drizzle-orm";

export class PremiumPackageQuery {
  static async getById(id: string): Promise<PremiumPackage | null> {
    const [premiumPackage] = await db.select().from(premiumPackages).where(eq(premiumPackages.id, id)).limit(1);
    return premiumPackage || null;
  }

  static async getAll(): Promise<PremiumPackage[]> {
    const allPremiumPackages = await db.select().from(premiumPackages);
    return allPremiumPackages;
  }
}