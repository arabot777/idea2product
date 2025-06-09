"use server";

import { TasksQuery } from "@/lib/db/crud/task/tasks.query";
import { Task } from "@/lib/db/schemas/task/task"; // Still need Task for the query result
import { revalidatePath } from "next/cache";
import { TaskDto } from "@/lib/types/task/task.dto";
import { TaskMapper } from "@/lib/mappers/task/task";
import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { PageParams } from "@/utils/drizzle.page";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AppError } from "@/lib/types/app.error";
import { getTranslations } from 'next-intl/server';

export const getTasks = dataActionWithPermission(
  "getTasks",
  async (
    params: PageParams<Task>,
    userContext: UserContext
  ): Promise<{ data: TaskDto[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> => {
    try {
      const paginationParams = {
        ...params,
        filter: {
          ...params?.filter,
          searchKey: ["title", "description", "message"],
          userId: userContext.id,
        },
      };
      const tasksResult = await TasksQuery.getPagination(paginationParams);
      const data: TaskDto[] = tasksResult.data.map((task) => TaskMapper.toDTO(task));
      return {
        data,
        total: tasksResult.total,
        page: tasksResult.page,
        pageSize: tasksResult.pageSize,
        totalPages: tasksResult.totalPages,
        hasNext: tasksResult.hasNext,
        hasPrevious: tasksResult.hasPrevious,
      };
    } catch (error) {
      const t = await getTranslations('TaskGetTasks');
      console.error('errorFetchingTasks', error);
      if (error instanceof AppError) {
        throw error;
      }
      // Return empty array and 0 for all counts in case of unexpected errors
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }
);
