import { db } from "@/lib/db/drizzle";
import { userSubscriptionPlans, UserSubscriptionPlan } from "@/lib/db/schemas/billing/user-subscription-plan";
import { and, eq } from "drizzle-orm";
import { BillingStatusType } from "@/lib/types/billing/enum.bean";

export class UserSubscriptionPlanQuery {
  static async getById(id: string): Promise<UserSubscriptionPlan | null> {
    const [userSubscriptionPlan] = await db.select().from(userSubscriptionPlans).where(eq(userSubscriptionPlans.id, id)).limit(1);
    return userSubscriptionPlan || null;
  }

  static async getByUserIdAndStatus(userId: string, status: BillingStatusType): Promise<UserSubscriptionPlan | null> {
    const [userSubscriptionPlan] = await db.select().from(userSubscriptionPlans).where(and(eq(userSubscriptionPlans.userId, userId), eq(userSubscriptionPlans.status, status))).limit(1);
    return userSubscriptionPlan || null;
  }

  static async getByExternalId(externalId: string): Promise<UserSubscriptionPlan | null> {
    const [userSubscriptionPlan] = await db.select().from(userSubscriptionPlans).where(and(eq(userSubscriptionPlans.externalId, externalId))).limit(1);
    return userSubscriptionPlan || null;
  }

  static async getAll(): Promise<UserSubscriptionPlan[]> {
    const allUserSubscriptionPlans = await db.select().from(userSubscriptionPlans);
    return allUserSubscriptionPlans;
  }
}