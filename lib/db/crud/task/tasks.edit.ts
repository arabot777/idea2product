import { db } from "../../drizzle";
import { tasks, NewTask, Task } from "../../schemas/task/task";
import { eq } from "drizzle-orm";

export class TasksEdit {
  static async create(newTask: NewTask): Promise<Task> {
    const [result] = await db.insert(tasks).values(newTask).returning();
    return result;
  }

  static async update(id: string, updatedTask: Partial<NewTask>): Promise<Task> {
    const [result] = await db.update(tasks).set(updatedTask).where(eq(tasks.id, id)).returning();
    return result;
  }

  static async delete(id: string): Promise<Task> {
    const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result;
  }
}