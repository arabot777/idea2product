"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { BillableMetricsEdit } from "@/lib/db/crud/unibee/billable-metrics.edit";
import { NewBillableMetric } from "@/lib/db/schemas/unibee/billable-metric";
import { BillableMetricDto } from "@/lib/types/unibee/billable-metric-dto";
import { UnibeeNewMetricRequest } from "@/lib/types/unibee";
import { UnibeeClient } from "@/lib/unibee/client";

/**
 * Creates a new billable metric.
 * This server action first creates the metric in the unibee service,
 * then saves it to the local database.
 *
 * @param {BillableMetricDto} metricData - The data for the new metric.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating success or failure.
 */
export const createBillableMetric = dataActionWithPermission(
  "createBillableMetric",
  async (metricData: Omit<BillableMetricDto, "id" | "createdAt" | "updatedAt" | "unibeeExternalId">): Promise<{ success: boolean; message: string }> => {
    try {
      metricData.aggregationProperty = "value";
      const unibeeClient = UnibeeClient.getInstance();
      
      const newMetricRequest: UnibeeNewMetricRequest = {
        metricName: metricData.metricName,
        metricDescription: metricData.metricDescription || undefined,
        code: metricData.code,
        aggregationType: metricData.aggregationType,
        aggregationProperty: metricData.aggregationProperty,
        type: metricData.type,
      };

      const unibeeResponse = await unibeeClient.createNewMetric(newMetricRequest);

      if (unibeeResponse.code !== 0 || !unibeeResponse.data.merchantMetric) {
        throw new Error(unibeeResponse.message || "Failed to create metric in Unibee");
      }

      const dbMetricData: NewBillableMetric = {
        ...metricData,
        unibeeExternalId: String(unibeeResponse.data.merchantMetric.id),
      };

      await BillableMetricsEdit.create(dbMetricData);
      return { success: true, message: "Billable metric created successfully." };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("createBillableMetric Error:", errorMessage);
      return { success: false, message: errorMessage };
    }
  }
);
