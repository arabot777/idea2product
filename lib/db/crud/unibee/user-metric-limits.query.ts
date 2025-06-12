import { db } from "@/lib/db/drizzle";
import { userMetricLimits, UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { eq, and } from "drizzle-orm";

export class UserMetricLimitsQuery {
  static async getById(id: string): Promise<UserMetricLimit | undefined> {
    const [userMetricLimit] = await db
      .select()
      .from(userMetricLimits)
      .where(eq(userMetricLimits.id, id));
    return userMetricLimit;
  }

  static async getByUserIdAndCode(
    userId: string,
    code: string
  ): Promise<UserMetricLimit | undefined> {
    const [userMetricLimit] = await db
      .select()
      .from(userMetricLimits)
      .where(and(eq(userMetricLimits.userId, userId), eq(userMetricLimits.code, code)));
    return userMetricLimit;
  }

  static async getAll(): Promise<UserMetricLimit[]> {
    const userMetricLimitsList = await db.select().from(userMetricLimits);
    return userMetricLimitsList;
  }
}