"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { WaveSpeedClient } from "@/sdk/wavespeed/client";
import { FluxDevUltraFastRequest } from "@/sdk/wavespeed/requests/flux-dev-ultra-fast.request";
import { TasksEdit } from "@/lib/db/crud/task/tasks.edit";
import { TasksQuery } from "@/lib/db/crud/task/tasks.query";
import { taskResultMigration } from "@/app/actions/task/task-result-migration";
import { TaskDataEdit } from "@/lib/db/crud/task/task-data.edit";
import { taskCallCheck } from "@/app/actions/task/task-call-check";
import { taskCallRecord } from "@/app/actions/task/task-call-record";
import { taskCallRecordRevoke } from "@/app/actions/task/task-call-record-revoke";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";
import { BillableMetricsQuery } from "@/lib/db/crud/unibee/billable-metrics.query";
import { CODE } from "@/lib/unibean/metric-code";
import { TaskStatus, TaskStatusType, TaskResultStatus, TaskResultType } from "@/lib/types/task/enum.bean";
import { WaveSpeedResponse, ModelResult } from "@/sdk/wavespeed/types";
import { Task } from "@/lib/db/schemas/task/task";
import { NewTaskResult } from "@/lib/db/schemas/task/task-result";
import { TaskResultsQuery } from "@/lib/db/crud/task/task-results.query";

// Interface for image generation request parameters
export interface FluxDevUltraFastParams {
  prompt: string;
  image?: string;
  mask_image?: string;
  strength?: number;
  size?: string;
  num_inference_steps?: number;
  seed?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_base64_output?: boolean;
  enable_safety_checker?: boolean;
}

// Interface for task status
export interface TaskInfo {
  id: string;
  status: string;
  progress?: number;
  message?: string;
  result?: any;
}

const response2TaskInfo = (response: WaveSpeedResponse<ModelResult>): TaskInfo => {
  let status: TaskStatusType = TaskStatus.PENDING;
  let progress: number = 0;
  if (response.data.status === "completed") {
    status = TaskStatus.COMPLETED;
    progress = 100;
  } else if (response.data.status === "failed") {
    status = TaskStatus.FAILED;
    progress = 100;
  } else if (response.data.status === "processing") {
    status = TaskStatus.PROCESSING;
    progress = 30;
  } else if (response.data.status === "created") {
    status = TaskStatus.PENDING;
    progress = 15;
  } else {
    status = TaskStatus.FAILED;
    progress = 100;
  }

  return {
    id: response.data.id,
    status: status,
    progress: progress,
    result: response.data.status === "completed" ? response.data.outputs : undefined,
    message: response.data.status === "failed" ? response.data.error : undefined,
  };
};
/**
 * Calls AI image generation function
 * @param params AI image generation parameters
 * @param userContext User context
 */
export const wsFluxDevUltraFast = dataActionWithPermission(
  "wsFluxDevUltraFast",
  async (
    params: FluxDevUltraFastParams,
    userContext: UserContext // Pass userContext as a parameter
  ): Promise<TaskInfo> => {
    // Default parameters
    const defaultParams = {
      strength: 0.8,
      size: "1024*1024",
      num_inference_steps: 28,
      seed: -1,
      guidance_scale: 3.5,
      num_images: 1,
      enable_base64_output: false,
      enable_safety_checker: true,
    };

    try {
      // 1. Pre-check the task - check if the user has permission to call this function
      const checkResult = await taskCallCheck(params, defaultParams, CODE.FluxDevUltraFast, userContext);

      if (!checkResult.allow) {
        checkResult.error && console.error(checkResult.error);
        return {
          id: "",
          status: TaskStatus.FAILED,
          message: checkResult.metricLimit
            ? "Your call limit has been used up, please top up and try again"
            : "You do not have permission to call this function, please subscribe to a package that includes this function",
        };
      }

      // 2. generate request
      const request = new FluxDevUltraFastRequest(
        params.prompt,
        params.image,
        params.mask_image,
        params.strength,
        params.size,
        params.num_inference_steps,
        params.seed,
        params.guidance_scale,
        params.num_images,
        params.enable_base64_output,
        params.enable_safety_checker
      );
      // 3. Get WaveSpeed API Key
      const apiKey = process.env.WAVESPEED_API_KEY;
      if (!apiKey) {
        return {
          id: "",
          status: TaskStatus.FAILED,
          message: "WaveSpeed API Key is not configured",
        };
      }

      // 4. Create WaveSpeed client
      const client = new WaveSpeedClient({
        apiKey,
      });

      const task = await TasksEdit.create({
        userId: userContext.id!,
        type: "wsFluxDevUltraFast",
        status: TaskStatus.PENDING,
        title: "AI Image Generation Task",
        description: "Process image generation request via WaveSpeed FluxDevUltraFast API",
        progress: 0,
        startedAt: new Date(),
        checkInterval: 5,
        currentRequestAmount: checkResult.currentRequestAmount!,
      });

      // 5. Send request
      const response = await client.postModelCall(request);

      if (!response || !response.data || !response.data.id) {
        // Update task status and data asynchronously
        Promise.resolve().then(() => {
          TasksEdit.update(task.id, {
            status: TaskStatus.FAILED,
            progress: 100,
            endedAt: new Date(),
            message: "Invalid response data",
          }).catch((err) => console.error("Failed to update task status:", err));
          TaskDataEdit.create({
            taskId: task.id,
            inputData: JSON.stringify(params),
            outputData: response.data ? JSON.stringify(response.data) : "{}",
          }).catch((err) => console.error("Failed to create task data:", err));
        });
        return {
          id: task.id,
          status: TaskStatus.FAILED,
          message: "Failed to send request, invalid response data",
        };
      } else {
        const taskInfo = response2TaskInfo(response);

        // Update task status and data asynchronously
        Promise.resolve()
          .then(async () => {
            // 6. Record task call - consume user quota
            const recordResult = await taskCallRecord(
              checkResult.currentRequestAmount!,
              CODE.FluxDevUltraFast,
              checkResult.billableMetric as BillableMetric,
              userContext
            );
            if (recordResult.error) {
              console.error("Failed to record task:", recordResult.error);
            }
            await TasksEdit.update(task.id, {
              status: taskInfo.status,
              progress: taskInfo.progress,
              externalId: response.data.id,
              externalMetricEventId: recordResult.metricEventId.toString(),
            });
          })
          .catch((err) => console.error("Failed to execute:", err));
      }
      return {
        id: task.id,
        status: TaskStatus.PENDING,
      };
    } catch (error) {
      console.error("Failed to generate image:", error);
      return {
        id: "",
        status: TaskStatus.FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);
/**
 * Query task status
 * @param taskId Task ID
 */
export const wsFluxDevUltraFastStatus = dataActionWithPermission(
  "wsFluxDevUltraFastStatus",
  async (
    taskId: string,
    userContext: UserContext // Pass userContext as a parameter
  ): Promise<TaskInfo> => {
    let task: Task | undefined;
    try {
      task = await TasksQuery.getById(taskId);
      if (!task) {
        return {
          id: taskId,
          status: TaskStatus.FAILED,
          message: "Task does not exist",
        };
      }
      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED) {
        const taskResult = await TaskResultsQuery.getByTaskId(taskId);
        return {
          id: taskId,
          status: task.status,
          result:
            taskResult?.map((result) => {
              return result.storageUrl;
            }) || [],
          progress: task.progress,
          message: task.message || undefined,
        };
      }
      // Check if the task needs to be re-queried
      if (task.checkedAt) {
        const now = new Date();
        const checkedAt = new Date(task.checkedAt);
        const elapsedMs = now.getTime() - checkedAt.getTime();

        if (elapsedMs < (task.checkInterval || 5000)) {
          // Within the check interval, return the current status directly
          return {
            id: taskId,
            status: task.status,
            progress: task.progress,
            message: task.message || undefined,
          };
        }
      }

      // Get WaveSpeed API Key
      const apiKey = process.env.WAVESPEED_API_KEY;
      if (!apiKey) {
        return {
          id: taskId,
          status: TaskStatus.FAILED,
          message: "WaveSpeed API Key is not configured",
        };
      }
      // Create WaveSpeed client
      const client = new WaveSpeedClient({
        apiKey,
      });
      // Query task status
      const response = await client.getTaskStatus(task.externalId || "");
      if (!response || !response.data) {
        return {
          id: taskId,
          status: task.status,
          progress: task.progress,
          message: "Request failed, please try again later",
        };
      }

      const taskInfo = response2TaskInfo(response);
      if (taskInfo.status === "failed" || taskInfo.status === "cancelled" || taskInfo.status === "completed") {
        Promise.resolve().then(async () => {
          TasksEdit.update(taskId, {
            status: taskInfo.status,
            progress: taskInfo.progress,
            endedAt: new Date(),
            message: taskInfo.message,
          }).catch((err) => console.error("Execute exception:", err));
          TaskDataEdit.update(taskId, {
            outputData: JSON.stringify(response.data),
          }).catch((err) => console.error("Update task data failed:", err));
          if (taskInfo.status === "failed") {
            const billableMetric: BillableMetric | undefined = await BillableMetricsQuery.getByCode(CODE.FluxDevUltraFast);
            taskCallRecordRevoke(parseInt(task?.externalMetricEventId!, 0), task?.currentRequestAmount!, CODE.FluxDevUltraFast, billableMetric!, userContext)
              .then(() => {
                console.log("Task record revoked successfully");
              })
              .catch((err) => console.error("Task record revoke failed:", err));
          } else if (taskInfo.status === "completed") {
            const newResults: NewTaskResult[] =
              response.data.outputs?.map((output: string, index: number) => {
                return {
                  userId: userContext.id!,
                  taskId: taskId,
                  parentTaskId: task?.parentTaskId,
                  type: TaskResultType.IMAGE,
                  status: response.data.has_nsfw_contents[index] ? TaskResultStatus.REJECTED_NSFW : TaskResultStatus.COMPLETED,
                  storageUrl: output,
                  mimeType: "image/jpeg",
                };
              }) || [];
            taskResultMigration(newResults, userContext);
          }
        });
      } else {
        Promise.resolve()
          .then(async () => {
            TasksEdit.update(taskId, {
              status: taskInfo.status,
              progress: taskInfo.progress,
              checkedAt: new Date(),
            }).catch((err) => console.error("Execute exception:", err));
            TaskDataEdit.update(taskId, {
              outputData: JSON.stringify(response.data),
            }).catch((err) => console.error("Execute exception:", err));
          })
          .catch((err) => console.error("Execute exception:", err));
      }

      return taskInfo;
    } catch (error) {
      if (!task) {
        return {
          id: taskId,
          status: TaskStatus.FAILED,
          message: "Task does not exist",
        };
      } else {
        console.error("Query task status failed:", error);
        return {
          id: taskId,
          status: task.status,
          progress: task.progress,
          message: `${error instanceof Error ? error.message : "Request failed, please try again later"}`,
        };
      }
    }
  }
);
