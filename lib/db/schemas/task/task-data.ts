import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tasks } from "./task";

export const taskData = pgTable(
  "task_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .unique()
      .references(() => tasks.id, { onDelete: "cascade" }),
    inputData: text("input_data"), // Input data
    outputData: text("output_data"), // Output data
    createdAt: timestamp("created_at").notNull().defaultNow(), // Creation time
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Update time
  },
  (table) => [index("task_data_task_id_idx").on(table.taskId)]
);

export type TaskData = typeof taskData.$inferSelect;
export type NewTaskData = typeof taskData.$inferInsert;
