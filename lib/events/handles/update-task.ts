import { TasksEdit } from "@/lib/db/crud/task/tasks.edit";
import { TaskInfo } from "@/lib/types/task/task.bean";
import { TaskStatus } from "@/lib/types/task/enum.bean";
import { Task } from "@/lib/db/schemas/task/task";

interface UpdateTaskPayload {
  task: TaskInfo;
}

export const updateTaskHandler = async (payload: UpdateTaskPayload) => {
  const { task } = payload;
  if (!task.id) return;
  try {
    console.log("Update task:", task);
    const taskData: Partial<Task> = {
      status: task.status,
      progress: task.progress,
      message: task.message,
    };
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED) {
      taskData.endedAt = new Date();
    }
    await TasksEdit.update(task.id, taskData);
  } catch (error) {
    console.error(`Failed to update task ${task.id}:`, error);
  }
};
