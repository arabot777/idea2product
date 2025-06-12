import { db } from "@/lib/db/drizzle";
import {
  billableMetrics,
  NewBillableMetric,
  BillableMetric,
} from "@/lib/db/schemas/unibee/billable-metric";
import { eq } from "drizzle-orm";

export class BillableMetricsEdit {
  static async create(data: NewBillableMetric): Promise<BillableMetric | undefined> {
    const [newBillableMetric] = await db
      .insert(billableMetrics)
      .values(data)
      .returning();
    return newBillableMetric;
  }

  static async update(
    id: string,
    data: Partial<NewBillableMetric>
  ): Promise<BillableMetric | undefined> {
    const [updatedBillableMetric] = await db
      .update(billableMetrics)
      .set(data)
      .where(eq(billableMetrics.id, id))
      .returning();
    return updatedBillableMetric;
  }

  static async delete(id: string): Promise<BillableMetric | undefined> {
    const [deletedBillableMetric] = await db
      .delete(billableMetrics)
      .where(eq(billableMetrics.id, id))
      .returning();
    return deletedBillableMetric;
  }
}