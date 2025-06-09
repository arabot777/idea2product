import { db } from "@/lib/db/drizzle";
import { subscriptionPlans, SubscriptionPlan } from "@/lib/db/schemas/billing/subscription-plan";
import { eq } from "drizzle-orm";

export class SubscriptionPlanQuery {
  static async getById(id: string): Promise<SubscriptionPlan | null> {
    const [subscriptionPlan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return subscriptionPlan || null;
  }

  static async getAll(): Promise<SubscriptionPlan[]> {
    const allSubscriptionPlans = await db.select().from(subscriptionPlans);
    return allSubscriptionPlans;
  }
}