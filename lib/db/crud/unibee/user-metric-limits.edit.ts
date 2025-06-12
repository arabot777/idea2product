import { db } from "@/lib/db/drizzle";
import {
  userMetricLimits,
  NewUserMetricLimit,
  UserMetricLimit,
} from "@/lib/db/schemas/unibee/user-metric-limit";
import { eq } from "drizzle-orm";

export class UserMetricLimitsEdit {
  static async create(data: NewUserMetricLimit): Promise<UserMetricLimit | undefined> {
    const [newUserMetricLimit] = await db
      .insert(userMetricLimits)
      .values(data)
      .returning();
    return newUserMetricLimit;
  }

  static async update(
    id: string,
    data: Partial<NewUserMetricLimit>
  ): Promise<UserMetricLimit | undefined> {
    const [updatedUserMetricLimit] = await db
      .update(userMetricLimits)
      .set(data)
      .where(eq(userMetricLimits.id, id))
      .returning();
    return updatedUserMetricLimit;
  }

  static async delete(id: string): Promise<UserMetricLimit | undefined> {
    const [deletedUserMetricLimit] = await db
      .delete(userMetricLimits)
      .where(eq(userMetricLimits.id, id))
      .returning();
    return deletedUserMetricLimit;
  }
}