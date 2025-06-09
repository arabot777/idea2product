import { db } from "../../drizzle";
import { taskResults, NewTaskResult, TaskResult } from "../../schemas/task/task-result";
import { eq } from "drizzle-orm";

export class TaskResultsEdit {
  static async create(newTaskResult: NewTaskResult): Promise<TaskResult[]> {
    return db.insert(taskResults).values(newTaskResult).returning();
  }

  static async update(id: string, updatedTaskResult: Partial<NewTaskResult>): Promise<TaskResult[]> {
    return db.update(taskResults).set(updatedTaskResult).where(eq(taskResults.id, id)).returning();
  }

  static async delete(id: string): Promise<TaskResult[]> {
    return db.delete(taskResults).where(eq(taskResults.id, id)).returning();
  }
}