import { db } from "../../drizzle";
import { taskData, TaskData } from "../../schemas/task/task-data";
import { and, eq, count } from "drizzle-orm";
import { DrizzlePageUtils, PageParams, PaginationResult } from "@/utils/drizzle.page";

export class TaskDataQuery {
  static async getByTaskId(taskId: string): Promise<TaskData | undefined> {
    const result = await db.select().from(taskData).where(eq(taskData.taskId, taskId)).limit(1);
    return result[0];
  }

  static async list(limit: number = 10, offset: number = 0): Promise<TaskData[]> {
    return db
      .select()
      .from(taskData)
      .limit(limit)
      .offset(offset);
  }

  static async count(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(taskData);
    return result[0].count;
  }

  static async getPagination(params: PageParams<TaskData>): Promise<PaginationResult<TaskData>> {
    return DrizzlePageUtils.pagination<TaskData>(taskData, params);
  }
}