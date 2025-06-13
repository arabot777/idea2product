import { db } from "../../drizzle";
import { taskResults, TaskResult } from "../../schemas/task/task-result";
import { eq } from "drizzle-orm";
import { DrizzlePageUtils, PageParams, PaginationResult } from "@/utils/drizzle.page";

export class TaskResultsQuery {
  static async getById(id: string): Promise<TaskResult | undefined> {
    const result = await db.select().from(taskResults).where(eq(taskResults.id, id)).limit(1);
    return result[0];
  }

  static async getByTaskId(taskId: string): Promise<TaskResult[] | undefined> {
    const result = await db.select().from(taskResults).where(eq(taskResults.taskId, taskId));
    return result;
  }

  static async list(limit: number = 10, offset: number = 0, taskId?: string): Promise<TaskResult[]> {
    if (taskId) {
      return db.select().from(taskResults).where(eq(taskResults.taskId, taskId)).limit(limit).offset(offset);
    }
    return db.select().from(taskResults).limit(limit).offset(offset);
  }

  static async count(taskId?: string): Promise<number> {
    if (taskId) {
      const result = await db.select().from(taskResults).where(eq(taskResults.taskId, taskId)).execute();
      return result.length;
    }
    const result = await db.select().from(taskResults).execute();
    return result.length;
  }
  static async getPagination(params: PageParams<TaskResult>): Promise<PaginationResult<TaskResult>> {
    return DrizzlePageUtils.pagination<TaskResult>(taskResults, params);
  }
}
