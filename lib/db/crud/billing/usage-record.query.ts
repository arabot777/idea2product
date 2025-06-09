import { db } from "@/lib/db/drizzle";
import { usageRecords } from "@/lib/db/schemas/billing/usage-record";
import { InferSelectModel, eq } from "drizzle-orm";

export type UsageRecord = InferSelectModel<typeof usageRecords>;

export class UsageRecordQuery {
  static async getById(id: string): Promise<UsageRecord | null> {
    const [usageRecord] = await db.select().from(usageRecords).where(eq(usageRecords.id, id)).limit(1);
    return usageRecord || null;
  }

  static async getAll(): Promise<UsageRecord[]> {
    const allUsageRecords = await db.select().from(usageRecords);
    return allUsageRecords;
  }
}