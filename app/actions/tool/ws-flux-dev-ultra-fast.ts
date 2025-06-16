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
import { eventBus } from "@/lib/events/event-bus";
import { response2TaskInfo } from "@/sdk/wavespeed/task-info-converter";
import { TaskInfo } from "@/lib/types/task/task.bean";

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
      const request = FluxDevUltraFastRequest.create(
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
      // 5. Record task call - consume user quota
      const recordResult = await taskCallRecord(
        checkResult.currentRequestAmount!,
        CODE.FluxDevUltraFast,
        checkResult.billableMetric as BillableMetric,
        userContext
      );
      if (!recordResult.metricEventId || recordResult.error) {
        console.error("Failed to record task:", recordResult.error);
        return {
          id: "",
          status: TaskStatus.FAILED,
          message: "Subscription system error, please try again later",
        };
      }
      const task = await TasksEdit.create({
        userId: userContext.id!,
        type: "wsFluxDevUltraFast",
        status: TaskStatus.PENDING,
        title: "AI Image Generation Task",
        description: "Process image generation request via WaveSpeed FluxDevUltraFast API",
        progress: 0,
        startedAt: new Date(),
        externalId: "",
        externalMetricEventId: recordResult.metricEventId.toString(),
        checkInterval: 5,
        currentRequestAmount: checkResult.currentRequestAmount!,
      });

      // 5. Send request
      const response = await client.postModelCall(request);

      if (!response || !response.data || !response.data.id) {
        eventBus.publish({
          name: "task.update",
          payload: {
            task: {
              id: task.id,
              status: TaskStatus.FAILED,
              progress: 100,
              message: "Invalid response data",
            },
          },
        });
        eventBus.publish({
          name: "task.record.data",
          payload: {
            taskId: task.id,
            inputData: params,
            outputData: response.data || {},
          },
        });
        eventBus.publish({
          name: "task.revoke.call.record",
          payload: {
            task: task,
            userContext: userContext,
          },
        });
        return {
          id: task.id,
          status: TaskStatus.FAILED,
          message: "Failed to send request, invalid response data",
        };
      } else {
        const taskInfo = response2TaskInfo(response);
        await TasksEdit.update(task.id, {
          status: taskInfo.status,
          progress: taskInfo.progress,
          externalId: response.data.id,
          externalMetricEventId: recordResult.metricEventId.toString(),
        }).catch((err) => console.error("Failed to update task status:", err));
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
      let result: string[] | undefined = undefined;
      if (task.status === TaskStatus.COMPLETED) {
        const taskResult = await TaskResultsQuery.getByTaskId(taskId);
        result =
          taskResult?.map((result) => {
            return result.storageUrl || "";
          }) || [];
      }
      if (task.status === TaskStatus.PENDING || task.status === TaskStatus.PROCESSING || task.status === TaskStatus.TRANSFERING) {
        eventBus.publish({
          name: "task.sync.status",
          payload: {
            task: task,
            userContext: userContext,
          },
        });
      }
      return {
        id: taskId,
        status: task.status,
        result: result,
        progress: task.progress,
        message: task.message || undefined,
      };
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
