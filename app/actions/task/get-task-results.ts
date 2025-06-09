"use server";

import { getTranslations } from 'next-intl/server';
import { TaskResult } from "@/lib/db/schemas/task/task-result";
import { TaskResultDto } from "@/lib/types/task/task-result.dto";
import { TaskResultMapper } from "@/lib/mappers/task/task-result";
import { TaskResultsQuery } from "@/lib/db/crud/task/task-results.query";
import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { PageParams } from "@/utils/drizzle.page";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AppError } from "@/lib/types/app.error";

export const getTaskResults = dataActionWithPermission(
  "getTaskResults",
  async (
    params: PageParams<TaskResult>,
    userContext: UserContext
  ): Promise<{ data: TaskResultDto[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> => {
    try {
      const paginationParams = {
        ...params,
        searchKey: ["message","content"],
        filter: {
          ...params?.filter,
          userId: userContext.id,
        },
      };
      const taskResults = await TaskResultsQuery.getPagination(paginationParams);
      const data = TaskResultMapper.toDTOList(taskResults.data);
      return {
        data,
        total: taskResults.total,
        page: taskResults.page,
        pageSize: taskResults.pageSize,
        totalPages: taskResults.totalPages,
        hasNext: taskResults.hasNext,
        hasPrevious: taskResults.hasPrevious,
      };
    } catch (error) {
      const t = await getTranslations('TaskGetTaskResults');
      console.error('errorFetchingTaskResults', error);
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
