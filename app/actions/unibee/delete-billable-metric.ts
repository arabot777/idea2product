"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { BillableMetricsEdit } from "@/lib/db/crud/unibee/billable-metrics.edit";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { UnibeanClient } from "@/lib/unibean/client";
import { UserContext } from "@/lib/types/auth/user-context.bean";

/**
 * Deletes a billable metric.
 * This server action first deletes the metric from the Unibean service,
 * then deletes it from the local database.
 *
 * @param {string} id - The ID of the metric to delete.
 * @param {string} unibeeExternalId - The external ID from Unibean.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating success or failure.
 */
export const deleteBillableMetric = dataActionWithPermission(
  "deleteBillableMetric",
  async (id: string, userContext: UserContext): Promise<{ success: boolean; message: string }> => {
    try {
      const unibeanClient = UnibeanClient.getInstance();

      const billableMetric = await BillableMetricsQuery.getById(id);

      if (!billableMetric) {
        throw new Error("Billable metric not found");
      }
      const unibeeResponse = await unibeanClient.deleteMetric({
        metricId: parseInt(billableMetric.unibeeExternalId!, 0),
      });

      if (unibeeResponse.code !== 0) {
        throw new Error(unibeeResponse.message || "Failed to delete metric from Unibean");
      }

      await BillableMetricsEdit.delete(id);

      return { success: true, message: "Billable metric deleted successfully." };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("deleteBillableMetric Error:", errorMessage);
      return { success: false, message: errorMessage };
    }
  }
);
