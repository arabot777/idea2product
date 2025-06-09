import { db } from "../../drizzle";
import { tasks, NewTask, Task } from "../../schemas/task/task";
import { eq } from "drizzle-orm";

export class TasksEdit {
  static async create(newTask: NewTask): Promise<Task[]> {
    return db.insert(tasks).values(newTask).returning();
  }

  static async update(id: string, updatedTask: Partial<NewTask>): Promise<Task[]> {
    return db.update(tasks).set(updatedTask).where(eq(tasks.id, id)).returning();
  }

  static async delete(id: string): Promise<Task[]> {
    return db.delete(tasks).where(eq(tasks.id, id)).returning();
  }
}