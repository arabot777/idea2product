import { db } from "../../drizzle";
import { tasks, Task } from "../../schemas/task/task";
import { and, eq, count } from "drizzle-orm";
import { DrizzlePageUtils, PageParams, PaginationResult } from "@/utils/drizzle.page";

export class TasksQuery {
  static async getById(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  static async list(limit: number = 10, offset: number = 0, status?: string): Promise<Task[]> {
    const conditions = [];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    return db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
  }

  static async count(status?: string): Promise<number> {
    const conditions = [];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    const result = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(...conditions));
    return result[0].count;
  }

  static async getPagination(params: PageParams<Task>): Promise<PaginationResult<Task>> {
    return DrizzlePageUtils.pagination<Task>(tasks, params);
  }
}
