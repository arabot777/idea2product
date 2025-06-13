"use server";

import { actionWithPermission } from "@/lib/permission/guards/action";
import { UserMetricLimitsQuery } from "@/lib/db/crud/unibee/user-metric-limits.query";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UnibeanClient } from "@/lib/unibean/client";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";
import { NewUserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserMetricLimitMapper } from "@/lib/mappers/unibee/user-metric-limit";
import { UserMetricLimitDto } from "@/lib/types/unibee/user-metric-limit-dto";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AppError } from "@/lib/types/app.error";

export const taskCallRemain = actionWithPermission("taskCallRemain", async (userContext: UserContext): Promise<UserMetricLimitDto[]> => {
  // 1. Query user-metric-limits by user ID
  let userMetricLimitList: UserMetricLimit[] | undefined = await UserMetricLimitsQuery.getByUserId(userContext.id || "");

  // Check if there's any metric limit updated within the last 10 minutes
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
      userMetricLimitList = await UserMetricLimitsQuery.getByUserId(userContext.id || "");
    }
  }
  if (!userMetricLimitList || userMetricLimitList.length === 0) {
    return [];
  }

  return UserMetricLimitMapper.toDTOList(userMetricLimitList);
});
