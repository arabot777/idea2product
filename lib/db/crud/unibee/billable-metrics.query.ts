import { db } from "@/lib/db/drizzle";
import { billableMetrics, BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";
import { eq } from "drizzle-orm";

export class BillableMetricsQuery {
  static async getById(id: string): Promise<BillableMetric | undefined> {
    const [billableMetric] = await db
      .select()
      .from(billableMetrics)
      .where(eq(billableMetrics.id, id));
    return billableMetric;
  }

  static async getByCode(code: string): Promise<BillableMetric | undefined> {
    const [billableMetric] = await db
      .select()
      .from(billableMetrics)
      .where(eq(billableMetrics.code, code));
    return billableMetric;
  }

  static async getAll(): Promise<BillableMetric[]> {
    const billableMetricsList = await db.select().from(billableMetrics);
    return billableMetricsList;
  }
}