"use server";

import { WaveSpeedClient } from "@/sdk/wavespeed/client";
import { TasksEdit } from "@/lib/db/crud/task/tasks.edit";

import { taskCallCheck } from "@/app/actions/task/task-call-check";
import { taskCallRecord } from "@/app/actions/task/task-call-record";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { BillableMetric } from "@/lib/db/schemas/unibee/billable-metric";
import { TaskStatus } from "@/lib/types/task/enum.bean";
import { eventBus } from "@/lib/events/event-bus";
import { response2TaskInfo } from "@/sdk/wavespeed/task-info-converter";
import { TaskInfo } from "@/lib/types/task/task.bean";
import { BaseRequest } from "@/sdk/wavespeed/base";
import { z, type ZodType, type ZodError } from "zod";
import { getDefaultParams, newRequest } from "@/sdk/wavespeed/code-mapping";
/**
 * Calls AI image generation function
 * @param params AI image generation parameters
 * @param userContext User context
 */
export const wsApiCall = async (
  input: {
    code: string;
    requestData: Record<string, any>; // Changed from BaseRequest<ZodType> to plain object
    defaultParams: Record<string, any>;
  },
  userContext: UserContext // Pass userContext as a parameter
): Promise<TaskInfo> => {
  try {
    const request = newRequest(input.code);
    // Update request with plain object data
    request.updateValue(input.requestData);
    try {
      request.validate();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        console.error("Validation error:", errorMessages);
        return {
          id: "",
          status: TaskStatus.FAILED,
          message: "Parameter validation failed: \n" + errorMessages.map((e) => `${e.field}: ${e.message}`).join("\n"),
        };
      }

      return {
        id: "",
        status: TaskStatus.FAILED,
        message: error.message,
      };
    }

    // 1. Pre-check the task - check if the user has permission to call this function
    const checkResult = await taskCallCheck(request.value, input.defaultParams, input.code, userContext);

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
    const recordResult = await taskCallRecord(checkResult.currentRequestAmount!, input.code, checkResult.billableMetric as BillableMetric, userContext);
    if (!recordResult.externalEventId || recordResult.error) {
      console.error("Failed to record task:", recordResult.error);
      return {
        id: "",
        status: TaskStatus.FAILED,
        message: recordResult.error || "Subscription system error, please try again later",
      };
    }
    const task = await TasksEdit.create({
      userId: userContext.id!,
      type: input.code,
      status: TaskStatus.PENDING,
      title: "AI Image Generation Task",
      description: "Process image generation request via WaveSpeed FluxDevUltraFast API",
      progress: 0,
      startedAt: new Date(),
      externalId: "",
      externalMetricEventId: recordResult.externalEventId,
      checkInterval: 5,
      currentRequestAmount: checkResult.currentRequestAmount!,
    });

    // 5. Send request
    const response = await client.postModelCall(request);
    eventBus.publish({
      name: "task.record.data",
      payload: {
        taskId: task.id,
        inputData: request.value,
        outputData: response.data || {},
        isUpdate: false,
      },
    });
    let taskInfo: TaskInfo;
    let externalId = "";
    let externalMetricEventId = "";
    if (!response || !response.data || !response.data.id) {
      taskInfo = {
        id: task.id,
        status: TaskStatus.FAILED,
        progress: 100,
        message: "Failed to send request, invalid response data",
      };
    } else {
      taskInfo = {
        id: task.id,
        status: TaskStatus.PENDING,
        progress: 0,
        message: "Task is pending",
      };
      // Delay update until the next status query
      externalId = response.data.id;
      externalMetricEventId = recordResult.externalEventId;
    }
    if (taskInfo.status === TaskStatus.FAILED) {
      eventBus.publish({
        name: "task.revoke.call.record",
        payload: {
          task: task,
          userContext: userContext,
        },
      });
    }
    await TasksEdit.update(task.id, {
      status: taskInfo.status,
      progress: taskInfo.progress,
      externalId: externalId,
      externalMetricEventId: externalMetricEventId,
    }).catch((err) => console.error("Failed to update task status:", err));

    return taskInfo;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return {
      id: "",
      status: TaskStatus.FAILED,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const wsApiCallWithDefaultParams = async (data: { code: string; requestData: Record<string, any> }, userContext: UserContext): Promise<TaskInfo> => {
  const defaultParams = getDefaultParams(data.code);
  // Convert requestData to plain object if it's a BaseRequest instance
  const requestData = data.requestData?.toJSON ? data.requestData.toJSON() : data.requestData;

  return wsApiCall(
    {
      code: data.code,
      requestData: requestData,
      defaultParams: defaultParams,
    },
    userContext
  );
};
