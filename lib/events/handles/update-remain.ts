import { TaskDataEdit } from "@/lib/db/crud/task/task-data.edit";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { NewUserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserMetricLimitsQuery } from "@/lib/db/crud/unibee/user-metric-limits.query";
import { UnibeanClient } from "@/lib/unibean/client";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";

interface UpdateRemainPayload {
  userContext: UserContext;
}

export const updateRemainHandler = async (payload: UpdateRemainPayload) => {
  const { userContext } = payload;
  if (!userContext.id) return;
  try {
    let userMetricLimitList: UserMetricLimit[] | undefined = await UserMetricLimitsQuery.getByUserId(userContext.id || "");

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const hasRecentUpdates = userMetricLimitList?.some((limit) => limit.updatedAt && new Date(limit.updatedAt) > tenMinutesAgo);

    if (!hasRecentUpdates) {
      // Trigger Unibee synchronization
      const unibeeClient = UnibeanClient.getInstance();
      const metricResponse = await unibeeClient.getUserMetric({ userId: parseInt(userContext.unibeeExternalId || "", 0) });

      if (metricResponse && metricResponse.data && metricResponse.data.userMetric && metricResponse.data.userMetric.limitStats) {
        const updateDataList: NewUserMetricLimit[] = [];
        for (const metric of metricResponse.data.userMetric.limitStats) {
          const updateData: NewUserMetricLimit = {
            userId: userContext.id || "",
            metricName: metric.metricLimit.metricName,
            code: metric.metricLimit.code,
            totalLimit: metric.metricLimit.TotalLimit,
            currentUsedValue: metric.CurrentUsedValue,
          };
          updateDataList.push(updateData);
        }

        const toAdd: NewUserMetricLimit[] = [];
        const toUpdate: UserMetricLimit[] = [];
        const toDelete: UserMetricLimit[] = [];
        const noChange: UserMetricLimit[] = [];

        const existingMetricsMap = new Map<string, UserMetricLimit>();
        userMetricLimitList?.forEach((item) => {
          existingMetricsMap.set(item.code, item);
        });

        for (const newMetric of updateDataList) {
          const existingMetric = existingMetricsMap.get(newMetric.code);
          if (existingMetric) {
            // Check if an update is needed
            if (
              existingMetric.totalLimit !== newMetric.totalLimit ||
              existingMetric.currentUsedValue !== newMetric.currentUsedValue ||
              existingMetric.metricName !== newMetric.metricName ||
              existingMetric.userId !== newMetric.userId
            ) {
              const updateData: UserMetricLimit = {
                ...existingMetric,
                ...newMetric,
              };
              toUpdate.push(updateData);
            } else {
              noChange.push(existingMetric);
            }
            existingMetricsMap.delete(newMetric.code); // Remove processed items from the map
          } else {
            toAdd.push(newMetric);
          }
        }

        // Remaining items in existingMetricsMap need to be deleted
        existingMetricsMap.forEach((item) => toDelete.push(item));

        // Execute database operations
        if (toAdd.length > 0) {
          await UserMetricLimitsEdit.bulkCreate(toAdd);
        }
        if (toUpdate.length > 0) {
          await UserMetricLimitsEdit.bulkUpdate(toUpdate.map((item) => ({ id: item.id, data: item })));
        }
        if (toDelete.length > 0) {
          await UserMetricLimitsEdit.bulkDelete(toDelete.map((item) => item.id));
        }
      }
    }
  } catch (error) {
    console.error(`Failed to update remain:`, error);
  }
};
