import { TaskDataEdit } from "@/lib/db/crud/task/task-data.edit";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { UserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { NewUserMetricLimit } from "@/lib/db/schemas/unibee/user-metric-limit";
import { UserMetricLimitsQuery } from "@/lib/db/crud/unibee/user-metric-limits.query";
import { UnibeeClient } from "@/lib/unibee/client";
import { UserMetricLimitsEdit } from "@/lib/db/crud/unibee/user-metric-limits.edit";

interface UpdateUnibeeDataPayload {
}

export const updateUnibeeDataHandler = async () => {
    try {
     
  } catch (error) {
    console.error(`Failed to update remain:`, error);
  }
};
