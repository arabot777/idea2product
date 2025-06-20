"use server";

import { UserMetricLimitsQuery } from "@/lib/db/crud/unibee/user-metric-limits.query";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";
import { calculateFormula } from "@/lib/utils";
import { UnibeeClient } from "@/lib/unibee/client";
import { UserMetricLimitMapper } from "@/lib/mappers/unibee/user-metric-limit";
import { UserMetricLimitDto } from "@/lib/types/unibee/user-metric-limit-dto";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";
import { NewUserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";

interface ToolCallParams {
  // Definition of tool call parameters
  [key: string]: any;
}

interface ToolDefaultParams {
  // Definition of tool default parameters
  [key: string]: any;
}

interface CacheData {
  cachedUserMetricLimit: UserMetricLimit;
  billableMetric: BillableMetric;
}

const CACHE_TTL = 60 * 60 * 1000;

export async function taskCallCheck(
  toolCallParams: ToolCallParams,
  toolDefaultParams: ToolDefaultParams,
  code: string,
  userContext: UserContext,
): Promise<{
  allow: boolean;
  metricLimit?: UserMetricLimitDto;
  billableMetric?: BillableMetric;
  currentRequestAmount?: number;
  error?: string;
}> {
  const cacheKey = CacheKeys.USER_METRIC_LIMIT(userContext.id || "", code);
  const cacheData: CacheData | undefined = await cache.get(cacheKey);
  if (cacheData && cacheData.cachedUserMetricLimit && cacheData.billableMetric) {
    const currentRequestAmount = calculateFormula(cacheData.billableMetric.featureCalculator, toolCallParams, toolDefaultParams);
    const remainingLimit = cacheData.cachedUserMetricLimit.totalLimit - cacheData.cachedUserMetricLimit.currentUsedValue;
    if (currentRequestAmount > remainingLimit) {
      return {
        allow: false,
        metricLimit: UserMetricLimitMapper.toDTO(cacheData.cachedUserMetricLimit),
        error: "Call limit exceeded.",
      };
    }
    return {
      allow: true,
      metricLimit: UserMetricLimitMapper.toDTO(cacheData.cachedUserMetricLimit),
      billableMetric: cacheData.billableMetric,
      currentRequestAmount,
    };
  }
  // 1. Query user-metric-limits based on code
  let userMetricLimitList: UserMetricLimit[] | undefined = await UserMetricLimitsQuery.getByUserId(userContext.id || "");

  // 2. Query billable-metrics based on code
  const billableMetric: BillableMetric | undefined = await BillableMetricsQuery.getByCode(code);

  if (!billableMetric) {
    return {
      allow: false,
      metricLimit: undefined,
      error: "Billable metric not found for code: " + code,
    };
  }

  // 3. Unibee synchronization logic
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  let userMetricLimit = userMetricLimitList?.find((item) => item.code === code);
  if (!(userMetricLimit && userMetricLimit.updatedAt && new Date(userMetricLimit.updatedAt) > oneHourAgo)) {
    // Trigger unibee synchronization
    const unibeeClient = UnibeeClient.getInstance();
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

      userMetricLimit = undefined;
      for (const newMetric of updateDataList) {
        const existingMetric = existingMetricsMap.get(newMetric.code);
        if (existingMetric) {
          // Check if update is needed
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
            if (newMetric.code === code) {
              userMetricLimit = updateData;
            }
          } else {
            noChange.push(existingMetric);
            if (newMetric.code === code) {
              userMetricLimit = existingMetric;
            }
          }
          existingMetricsMap.delete(newMetric.code); // Remove processed existing data from map
        } else {
          toAdd.push(newMetric);
          if (newMetric.code === code) {
            userMetricLimit = { ...newMetric, id: "", createdAt: new Date(), updatedAt: new Date() };
          }
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
    } else {
      console.warn(`Failed to sync user metric from Unibee for userId: ${userContext.id}, code: ${code}`);
      // If synchronization fails and there's no local data, we can't verify, throw error
      if (!userMetricLimitList || userMetricLimitList.length === 0) {
        return {
          allow: false,
          metricLimit: undefined,
          error: "Failed to get user metric limits and no local data available.",
        };
      }
    }
  }

  // 4. After confirming user-metric-limits data is valid, perform verification
  if (!userMetricLimit || userMetricLimit.totalLimit === undefined || userMetricLimit.currentUsedValue === undefined) {
    return {
      allow: false,
      metricLimit: undefined,
      error: "User metric limit data is invalid or missing totalLimit/currentUsedValue.",
    };
  }

  cache.set(
    cacheKey,
    {
      cachedUserMetricLimit: userMetricLimit,
      billableMetric: billableMetric,
    },
    CACHE_TTL
  );

  const currentRequestAmount = calculateFormula(billableMetric.featureCalculator, toolCallParams, toolDefaultParams);

  const remainingLimit = userMetricLimit.totalLimit - userMetricLimit.currentUsedValue;

  if (currentRequestAmount > remainingLimit) {
    return {
      allow: false,
      metricLimit: UserMetricLimitMapper.toDTO(userMetricLimit),
      error: "Call limit exceeded.",
    };
  }

  return {
    allow: true,
    metricLimit: UserMetricLimitMapper.toDTO(userMetricLimit),
    billableMetric,
    currentRequestAmount,
  }; // Verification passed
}
