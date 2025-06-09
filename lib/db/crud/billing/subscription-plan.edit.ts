import { db } from "@/lib/db/drizzle";
import { subscriptionPlans, NewSubscriptionPlan, SubscriptionPlan } from "@/lib/db/schemas/billing/subscription-plan";
import { eq } from "drizzle-orm";

export class SubscriptionPlanEdit {
  static async create(data: NewSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newSubscriptionPlan] = await db.insert(subscriptionPlans).values(data).returning();
    return newSubscriptionPlan;
  }

  static async update(id: string, data: Partial<NewSubscriptionPlan>): Promise<SubscriptionPlan | null> {
    const [updatedSubscriptionPlan] = await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id)).returning();
    return updatedSubscriptionPlan || null;
  }

  static async delete(id: string): Promise<SubscriptionPlan | null> {
    const [deletedSubscriptionPlan] = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id)).returning();
    return deletedSubscriptionPlan || null;
  }
}