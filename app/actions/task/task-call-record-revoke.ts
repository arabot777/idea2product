"use server";

import { UnibeeClient } from "@/lib/unibee/client";
import { cache } from "@/lib/cache";
import { CacheKeys } from "@/lib/cache/keys";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";
import { BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";

interface CacheData {
  cachedUserMetricLimit: UserMetricLimit;
  billableMetric: BillableMetric;
}

const CACHE_TTL = 30 * 60 * 1000;

export async function taskCallRecordRevoke(
  metricEventId: number,
  currentRequestAmount: number,
  code: string,
  billableMetric: BillableMetric,
  userContext: UserContext
): Promise<{
  success: boolean;
  error?: string;
}> {
  const result: {
    success: boolean;
    error?: string;
  } = {
    success: false,
  };
  try {
    const unibeeClient = UnibeeClient.getInstance();

    // 1. Call UnibeeClient's deleteMetric to revoke the third-party event
    const unibeeResponse = await unibeeClient.deleteMetric({
      metricId: metricEventId,
    });

    if (unibeeResponse.code !== 0) {
      result.error = unibeeResponse.message || "Failed to delete metric event in Unibee";
      return result;
    }

    // 2. Increase the used value in the database
    await UserMetricLimitsEdit.increaseUsedValue(userContext.id!, code, currentRequestAmount);

    // 3. Update the cache
    const cacheKey = CacheKeys.USER_METRIC_LIMIT(userContext.id || "", code);
    const cacheData: CacheData | undefined = await cache.get(cacheKey);

    if (cacheData) {
      const updatedAmount = (cacheData.cachedUserMetricLimit.currentUsedValue || 0) + currentRequestAmount;
      await cache.set(
        cacheKey,
        {
          ...cacheData,
          cachedUserMetricLimit: {
            ...cacheData.cachedUserMetricLimit,
            currentUsedValue: updatedAmount,
          },
        },
        CACHE_TTL
      );
    }
    result.success = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : "An unknown error occurred";
    return result;
  }
}
