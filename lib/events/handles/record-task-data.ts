import { TaskDataEdit } from "@/lib/db/crud/task/task-data.edit";

interface RecordTaskDataPayload {
  taskId: string;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  isUpdate?: boolean;
}

export const recordTaskDataHandler = async (payload: RecordTaskDataPayload) => {
  const { taskId, inputData, outputData, isUpdate } = payload;
  if (!taskId) return;
  if (!inputData && !outputData) {
    return;
  }
  try {
    console.log("Update task data:", taskId);
    const taskData = {
      taskId,
      inputData: inputData ? JSON.stringify(inputData) : undefined,
      outputData: outputData ? JSON.stringify(outputData) : undefined,
    };
    const filteredTaskData = Object.entries(taskData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    if (isUpdate) {
      await TaskDataEdit.update(taskId, filteredTaskData);
    } else {
      await TaskDataEdit.create(filteredTaskData);
    }
  } catch (error) {
    console.error(`Failed to record task ${taskId} data:`, error);
  }
};
