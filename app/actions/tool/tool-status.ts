"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { TasksQuery } from "@/lib/db/crud/task/tasks.query";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { TaskStatus } from "@/lib/types/task/enum.bean";
import { Task } from "@/lib/db/schemas/task/task";
import { TaskResultsQuery } from "@/lib/db/crud/task/task-results.query";
import { eventBus } from "@/lib/events/event-bus";
import { TaskInfo } from "@/lib/types/task/task.bean";

/**
 * Query task status
 * @param taskId Task ID
 */
export const toolStatus = dataActionWithPermission(
  "toolStatus",
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
      if (task.status === TaskStatus.PENDING || task.status === TaskStatus.PROCESSING || task.status === TaskStatus.TRANSFER_START) {
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
