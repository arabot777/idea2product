import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index, integer } from "drizzle-orm/pg-core";
import { profiles } from "../auth/profile";
import { taskStatusEnum } from "./enum";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }), // Associated user ID
  parentTaskId: uuid("parent_task_id"), // Parent task ID, for task chaining
  type: text("type").notNull(), // Task type
  status: taskStatusEnum("status").notNull().default("pending"), // Task status
  title: text("title"), // Task title
  description: text("description"), // Task description
  progress: integer("progress").notNull().default(0), // Task progress
  startedAt: timestamp("started_at"), // Start time
  endedAt: timestamp("ended_at"), // End time
  checkedAt: timestamp("checked_at"), // Check status time, set only if the task times out and is not completed for further processing
  checkInterval: integer("check_interval").notNull().default(5), // Check interval in seconds
  message: text("message"), // Task message
  currentRequestAmount: integer("current_request_amount").notNull().default(0), // Current request amount
  externalId: text("external_id"), // External task ID
  externalMetricEventId: text("external_metric_event_id"), // External task result
  createdAt: timestamp("created_at").notNull().defaultNow(), // Creation time
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // Update time
}, (table) => [
  index("task_user_id_idx").on(table.userId),
  index("task_status_idx").on(table.status),
  index("task_type_idx").on(table.type),
  index("task_created_at_idx").on(table.createdAt),
]);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;