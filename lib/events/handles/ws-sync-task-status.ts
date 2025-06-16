import { UserContext } from "@/lib/types/auth/user-context.bean";
import { TaskStatus, TaskResultStatus, TaskResultTypeType } from "@/lib/types/task/enum.bean";
import { WaveSpeedClient } from "@/sdk/wavespeed/client";
import { response2TaskInfo } from "@/sdk/wavespeed/task-info-converter";
import { Task } from "@/lib/db/schemas/task/task";
import { TasksEdit } from "@/lib/db/crud/task/tasks.edit";
import { TaskDataEdit } from "@/lib/db/crud/task/task-data.edit";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { taskCallRecordRevoke } from "@/app/actions/task/task-call-record-revoke";
import { taskResultMigration } from "@/app/actions/task/task-result-migration";
import { NewTaskResult } from "@/lib/db/schemas/task/task-result";
import { TaskInfo } from "@/lib/types/task/task.bean";

interface WsSyncTaskStatusPayload {
  task: Task;
  userContext: UserContext;
}

export const wsSyncTaskStatusHandler = async (payload: WsSyncTaskStatusPayload) => {
  const { task, userContext } = payload;
  if (!task || !task.id) return;
  console.log("Sync task status:", task);
  if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED || task.status === TaskStatus.TRANSFERING) {
    // Task is already completed, failed, or cancelled
    return;
  }
  try {
    if (task.checkedAt) {
      const now = new Date();
      const checkedAt = new Date(task.checkedAt);
      const elapsedMs = now.getTime() - checkedAt.getTime();
      if (elapsedMs < (task.checkInterval || 2000)) {
        // Task is checked within the check interval
        return;
      }
    }
    await TasksEdit.update(task.id, {
      checkedAt: new Date(),
    }).catch((err) => console.error("Update task checkedAt failed:", err));
    let taskInfo: TaskInfo;
    let wsResult: {
      url: string;
      has_nsfw_contents: boolean;
    }[] = [];

    const apiKey = process.env.WAVESPEED_API_KEY;
    if (!apiKey) {
      taskInfo = {
        id: task.id,
        status: TaskStatus.FAILED,
        message: "WaveSpeed API Key is not configured",
      };
    } else {
      const client = new WaveSpeedClient({
        apiKey,
      });
      const response = await client.getTaskStatus(task.externalId || "");
      if (!response || !response.data) {
        taskInfo = {
          id: task.id,
          status: task.status,
          progress: task.progress,
          message: "Request failed, please try again later",
        };
      } else {
        taskInfo = response2TaskInfo(response);
        if (
          taskInfo.status === TaskStatus.COMPLETED ||
          taskInfo.status === TaskStatus.TRANSFER_START ||
          taskInfo.status === TaskStatus.FAILED ||
          taskInfo.status === TaskStatus.CANCELLED
        ) {
          await TaskDataEdit.update(task.id, {
            outputData: JSON.stringify(response.data),
          }).catch((err) => console.error("Update task data failed:", err));
        }
        if (taskInfo.status === TaskStatus.TRANSFER_START) {
          wsResult =
            response.data.outputs?.map((output: string, index: number) => {
              return {
                url: output,
                has_nsfw_contents: response.data.has_nsfw_contents?.[index] || false,
              };
            }) || [];
        }
      }
    }
    if (
      taskInfo.status === TaskStatus.COMPLETED ||
      taskInfo.status === TaskStatus.TRANSFER_START ||
      taskInfo.status === TaskStatus.FAILED ||
      taskInfo.status === TaskStatus.CANCELLED
    ) {
      await TasksEdit.update(task.id, {
        status: taskInfo.status === TaskStatus.TRANSFER_START ? TaskStatus.TRANSFERING : taskInfo.status,
        progress: taskInfo.progress,
        endedAt: new Date(),
        message: taskInfo.message,
      }).catch((err) => console.error("Update task failed:", err));
      if (taskInfo.status === TaskStatus.FAILED) {
        const billableMetric = await BillableMetricsQuery.getByCode(task.type);
        await taskCallRecordRevoke(parseInt(task?.externalMetricEventId!, 0), task?.currentRequestAmount!, task.type, billableMetric!, userContext);
      } else if (taskInfo.status === TaskStatus.TRANSFER_START) {
        const newResults: NewTaskResult[] =
          wsResult.map((output: { url: string; has_nsfw_contents: boolean }) => {
            return {
              userId: userContext.id!,
              taskId: task.id,
              parentTaskId: task?.parentTaskId,
              type: "",
              status: output.has_nsfw_contents ? TaskResultStatus.REJECTED_NSFW : TaskResultStatus.COMPLETED,
              storageUrl: output.url,
            };
          }) || [];
        await taskResultMigration(newResults, userContext).catch((err) => console.error("Task result migration failed:", err));
        await TasksEdit.update(task.id, {
          status: TaskStatus.COMPLETED,
          progress: 100,
          endedAt: new Date(),
          message: "Task completed successfully",
        }).catch((err) => console.error("Update task failed:", err));
      }
    } else {
      await TasksEdit.update(task.id, {
        status: taskInfo.status,
        progress: taskInfo.progress,
        message: taskInfo.message,
        checkedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Failed to sync task ${task.id} status:`, error);
  }
};
