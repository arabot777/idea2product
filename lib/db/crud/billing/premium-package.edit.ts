import { db } from "@/lib/db/drizzle";
import { premiumPackages, NewPremiumPackage, PremiumPackage } from "@/lib/db/schemas/billing/premium-package";
import { eq } from "drizzle-orm";

export class PremiumPackageEdit {
  static async create(data: NewPremiumPackage): Promise<PremiumPackage> {
    const [newPremiumPackage] = await db.insert(premiumPackages).values(data).returning();
    return newPremiumPackage;
  }

  static async update(id: string, data: Partial<NewPremiumPackage>): Promise<PremiumPackage | null> {
    const [updatedPremiumPackage] = await db.update(premiumPackages).set(data).where(eq(premiumPackages.id, id)).returning();
    return updatedPremiumPackage || null;
  }

  static async delete(id: string): Promise<PremiumPackage | null> {
    const [deletedPremiumPackage] = await db.delete(premiumPackages).where(eq(premiumPackages.id, id)).returning();
    return deletedPremiumPackage || null;
  }
}