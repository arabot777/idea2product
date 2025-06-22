"use server";

import { UnibeeClient } from "@/lib/unibee/client";
import { cache } from "@/lib/cache";
import { CacheKeys } from "@/lib/cache/keys";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { CODE } from "@/lib/unibee/metric-code";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserMetricLimitsQuery } from "@/lib/db/crud/unibee/user-metric-limits.query";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";
import { v4 as uuidv4 } from "uuid";
import { BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";

interface CacheData {
  cachedUserMetricLimit: UserMetricLimit;
  billableMetric: BillableMetric;
}

// Originally cached for 60 minutes, but after security adjustments, changed to 10 minutes
const CACHE_TTL = 30 * 60 * 1000;

export async function taskCallRecord(
  currentRequestAmount: number,
  code: string,
  billableMetric: BillableMetric,
  userContext: UserContext
): Promise<{
  externalEventId: string;
  usedAmount: number;
  error?: string;
}> {
  const result: {
    externalEventId: string;
    usedAmount: number;
    error?: string;
  } = {
    externalEventId: "",
    usedAmount: currentRequestAmount,
  };
  try {
    const unibeeClient = UnibeeClient.getInstance();
    const externalEventId = uuidv4();
    result.externalEventId = externalEventId;
    // 1. Call UnibeeClient's createNewMetricEvent to send to third party
    const unibeeResponse = await unibeeClient.createNewMetricEvent({
      externalEventId,
      metricCode: code,
      userId: parseInt(userContext.unibeeExternalId!),
      metricProperties: {
        [billableMetric.aggregationProperty as string]: currentRequestAmount,
      },
    });

    if (unibeeResponse.code !== 0 || !unibeeResponse.data.merchantMetricEvent) {
      result.error = unibeeResponse.message || "Failed to create metric event in Unibee";
      return result;
    }
    await UserMetricLimitsEdit.decreaseUsedValue(userContext.id!, code, currentRequestAmount);

    const cacheKey = CacheKeys.USER_METRIC_LIMIT(userContext.id || "", code);
    const cacheData: CacheData | undefined = await cache.get(cacheKey);

    if (cacheData) {
      const updatedAmount = (cacheData.cachedUserMetricLimit.currentUsedValue || 0) - currentRequestAmount;
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
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : "An unknown error occurred";
    return result;
  }
}
