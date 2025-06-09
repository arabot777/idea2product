import { db } from "@/lib/db/drizzle";
import { userSubscriptionPlans, NewUserSubscriptionPlan, UserSubscriptionPlan } from "@/lib/db/schemas/billing/user-subscription-plan";
import { eq } from "drizzle-orm";

export class UserSubscriptionPlanEdit {
  static async create(data: NewUserSubscriptionPlan): Promise<UserSubscriptionPlan> {
    const [newUserSubscriptionPlan] = await db.insert(userSubscriptionPlans).values(data).returning();
    return newUserSubscriptionPlan;
  }

  static async update(id: string, data: Partial<NewUserSubscriptionPlan>): Promise<UserSubscriptionPlan | null> {
    const [updatedUserSubscriptionPlan] = await db.update(userSubscriptionPlans).set(data).where(eq(userSubscriptionPlans.id, id)).returning();
    return updatedUserSubscriptionPlan || null;
  }

  static async delete(id: string): Promise<UserSubscriptionPlan | null> {
    const [deletedUserSubscriptionPlan] = await db.delete(userSubscriptionPlans).where(eq(userSubscriptionPlans.id, id)).returning();
    return deletedUserSubscriptionPlan || null;
  }
}