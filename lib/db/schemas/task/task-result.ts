import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tasks } from "./task";
import { taskResultStatusEnum, taskResultTypeEnum } from "./enum";
import { profiles } from "../auth/profile";

export const taskResults = pgTable(
  "task_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }), // Associated user ID
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    parentTaskId: uuid("parent_task_id"), // Parent task ID, for task chaining
    type: text("type").notNull(), // Result type
    status: taskResultStatusEnum("status").notNull().default("pending"), // Result status
    message: text("message"), // Task message

    // Content storage related fields
    content: text("content"), // Directly store text content (for smaller content)
    storageUrl: text("storage_url"), // Storage URL (for larger content)

    // Metadata
    mimeType: text("mime_type"), // MIME type

    // Basic properties for images/videos
    width: text("width"), // Width (image/video)
    height: text("height"), // Height (image/video)
    // Audio/video and other basic properties
    duration: text("duration"), // Duration (video/audio)
    // File and other general properties
    fileMimeType: text("file_mime_type"), // File MIME type
    fileSize: text("file_size"), // File size
    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("task_result_user_id_idx").on(table.userId),
    index("task_result_task_id_idx").on(table.taskId),
    index("task_result_type_idx").on(table.type),
    index("task_result_status_idx").on(table.status),
  ]
);

export type TaskResult = typeof taskResults.$inferSelect;
export type NewTaskResult = typeof taskResults.$inferInsert;
