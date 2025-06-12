"use server";

import { actionWithPermission } from "@/lib/permission/guards/action";
import { BillableMetricMapper } from "@/lib/mappers/unibee/billable-metric";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { BillableMetricDto } from "@/lib/types/unibee/billable-metric-dto";

/**
 * Retrieves a list of all billable metrics.
 * This server action fetches data from the database and maps it to the application-level type.
 *
 * @returns {Promise<BillableMetricDto[]>} A promise that resolves to an array of billable metrics.
 */
export const listBillableMetrics = actionWithPermission("listBillableMetrics", async (): Promise<BillableMetricDto[]> => {
  const dbMetrics = await BillableMetricsQuery.getAll();
  return BillableMetricMapper.toDTOList(dbMetrics);
});
