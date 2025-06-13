"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { BillableMetricsEdit } from "@/lib/db/crud/unibee/billable-metrics.edit";
import { BillableMetricDto } from "@/lib/types/unibee/billable-metric-dto";

/**
 * Updates an existing billable metric.
 * This server action updates the metric in the local database.
 *
 * @param {BillableMetricDto} metricData - The data to update.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating success or failure.
 */
export const updateBillableMetric = dataActionWithPermission(
  "updateBillableMetric",
  async (metricData: Omit<BillableMetricDto, "createdAt" | "updatedAt" | "unibeeExternalId">): Promise<{ success: boolean; message: string }> => {
    try {
      await BillableMetricsEdit.update(metricData.id, {
        ...metricData,
        featureOnceMax: metricData.featureOnceMax,
      });
      return { success: true, message: "Billable metric updated successfully." };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("updateBillableMetric Error:", errorMessage);
      return { success: false, message: errorMessage };
    }
  }
);
