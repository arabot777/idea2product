import { WaveSpeedResponse, ModelResult } from "@/sdk/wavespeed/types";
import { TaskStatus, TaskStatusType } from "@/lib/types/task/enum.bean";
import { TaskInfo } from "@/lib/types/task/task.bean";

export const response2TaskInfo = (response: WaveSpeedResponse<ModelResult>): TaskInfo => {
  let status: TaskStatusType = TaskStatus.PENDING;
  let progress: number = 0;
  if (response.data.status === "completed") {
    status = TaskStatus.TRANSFERING;
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
