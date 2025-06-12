import { db } from "@/lib/db/drizzle";
import { subscriptionPlans, SubscriptionPlan, NewSubscriptionPlan } from "@/lib/db/schemas/billing/subscription-plan";
import { eq } from "drizzle-orm";

export class SubscriptionPlanQuery {
  static async getById(id: string): Promise<SubscriptionPlan | null> {
    const [subscriptionPlan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
    return subscriptionPlan || null;
  }

  static async getByExternalId(id: string): Promise<SubscriptionPlan | null> {
    const [subscriptionPlan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.externalId, id)).limit(1);
    return subscriptionPlan || null;
  }

  static async getAll(): Promise<SubscriptionPlan[]> {
    const allSubscriptionPlans = await db.select().from(subscriptionPlans);
    return allSubscriptionPlans;
  }

  static async getAllActive(): Promise<SubscriptionPlan[]> {
    const allSubscriptionPlans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    return allSubscriptionPlans;
  }


  static async create(plan: NewSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  static async update(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    const [updatedPlan] = await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.id, id)).returning();
    return updatedPlan || null;
  }
}