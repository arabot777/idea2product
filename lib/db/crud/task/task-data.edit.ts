import { db } from "../../drizzle";
import { taskData, NewTaskData, TaskData } from "../../schemas/task/task-data";
import { eq } from "drizzle-orm";

export class TaskDataEdit {
  static async create(newTaskData: NewTaskData): Promise<TaskData> {
    const [result] = await db.insert(taskData).values(newTaskData).returning();
    return result;
  }

  static async update(taskId: string, updatedTaskData: Partial<NewTaskData>): Promise<TaskData> {
    const [result] = await db.update(taskData).set(updatedTaskData).where(eq(taskData.taskId, taskId)).returning();
    return result;
  }

  static async delete(taskId: string): Promise<TaskData> {
    const [result] = await db.delete(taskData).where(eq(taskData.taskId, taskId)).returning();
    return result;
  }
}