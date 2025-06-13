import { db } from "@/lib/db/drizzle";
import { userMetricLimits, NewUserMetricLimit, UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { eq, inArray, sql, and } from "drizzle-orm";

export class UserMetricLimitsEdit {
  static async create(data: NewUserMetricLimit): Promise<UserMetricLimit | undefined> {
    const [newUserMetricLimit] = await db.insert(userMetricLimits).values(data).returning();
    return newUserMetricLimit;
  }

  static async update(id: string, data: Partial<NewUserMetricLimit>): Promise<UserMetricLimit | undefined> {
    const [updatedUserMetricLimit] = await db.update(userMetricLimits).set(data).where(eq(userMetricLimits.id, id)).returning();
    return updatedUserMetricLimit;
  }

  static async delete(id: string): Promise<UserMetricLimit | undefined> {
    const [deletedUserMetricLimit] = await db.delete(userMetricLimits).where(eq(userMetricLimits.id, id)).returning();
    return deletedUserMetricLimit;
  }

  static async decreaseUsedValue(userId: string, code: string, usedValue: number): Promise<UserMetricLimit | undefined> {
    // Perform atomic update without querying first
    const [updatedMetricLimit] = await db
      .update(userMetricLimits)
      .set({
        currentUsedValue: sql`GREATEST(0, ${userMetricLimits.currentUsedValue} - ${usedValue})`,
      })
      .where(and(eq(userMetricLimits.userId, userId), eq(userMetricLimits.code, code)))
      .returning();

    return updatedMetricLimit;
  }

  static async increaseUsedValue(userId: string, code: string, usedValue: number): Promise<UserMetricLimit | undefined> {
    // Perform atomic update without querying first
    const [updatedMetricLimit] = await db
      .update(userMetricLimits)
      .set({
        currentUsedValue: sql`${userMetricLimits.currentUsedValue} + ${usedValue}`,
      })
      .where(and(eq(userMetricLimits.userId, userId), eq(userMetricLimits.code, code)))
      .returning();

    return updatedMetricLimit;
  }

  static async bulkCreate(data: NewUserMetricLimit[]): Promise<UserMetricLimit[]> {
    if (data.length === 0) {
      return [];
    }
    const newRecords = await db.insert(userMetricLimits).values(data).returning();
    return newRecords;
  }

  static async bulkUpdate(updates: { id: string; data: Partial<NewUserMetricLimit> }[]): Promise<UserMetricLimit[]> {
    if (updates.length === 0) {
      return [];
    }
    const updatedRecords: UserMetricLimit[] = [];
    await db.transaction(async (tx) => {
      for (const update of updates) {
        const [updatedRecord] = await tx.update(userMetricLimits).set(update.data).where(eq(userMetricLimits.id, update.id)).returning();
        if (updatedRecord) {
          updatedRecords.push(updatedRecord);
        }
      }
    });
    return updatedRecords;
  }

  static async bulkDelete(ids: string[]): Promise<UserMetricLimit[]> {
    if (ids.length === 0) {
      return [];
    }
    const deletedRecords = await db.delete(userMetricLimits).where(inArray(userMetricLimits.id, ids)).returning();
    return deletedRecords;
  }
}
