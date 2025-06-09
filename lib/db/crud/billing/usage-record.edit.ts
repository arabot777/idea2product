import { db } from "@/lib/db/drizzle";
import { usageRecords } from "@/lib/db/schemas/billing/usage-record";
import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";

export type NewUsageRecord = InferInsertModel<typeof usageRecords>;
export type UsageRecord = InferSelectModel<typeof usageRecords>;

export class UsageRecordEdit {
  static async create(data: NewUsageRecord): Promise<UsageRecord> {
    const [newUsageRecord] = await db.insert(usageRecords).values(data).returning();
    return newUsageRecord;
  }

  static async update(id: string, data: Partial<NewUsageRecord>): Promise<UsageRecord | null> {
    const [updatedUsageRecord] = await db.update(usageRecords).set(data).where(eq(usageRecords.id, id)).returning();
    return updatedUsageRecord || null;
  }

  static async delete(id: string): Promise<UsageRecord | null> {
    const [deletedUsageRecord] = await db.delete(usageRecords).where(eq(usageRecords.id, id)).returning();
    return deletedUsageRecord || null;
  }
}