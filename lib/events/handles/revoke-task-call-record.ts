import { Task } from "@/lib/db/schemas/task/task";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { taskCallRecordRevoke } from "@/app/actions/task/task-call-record-revoke";

interface RevokeTaskCallRecordPayload {
  task: Task;
  userContext: UserContext;
}

export const revokeTaskCallRecordHandler = async (payload: RevokeTaskCallRecordPayload) => {
  const { task, userContext } = payload;
  if (!task.id || !task.externalMetricEventId || !task.currentRequestAmount || !task.type) return;
  try {
    console.log("Revoke task call record:", task);
    const billableMetric = await BillableMetricsQuery.getByCode(task.type);
    await taskCallRecordRevoke(task.externalMetricEventId, task.currentRequestAmount, task.type, billableMetric!, userContext);
  } catch (error) {
    console.error(`Failed to revoke task ${task.id} call record:`, error);
  }
};
