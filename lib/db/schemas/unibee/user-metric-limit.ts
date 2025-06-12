import { pgTable, uuid, text, timestamp, index, integer, doublePrecision } from "drizzle-orm/pg-core";
import { profiles } from "../auth/profile";

export const userMetricLimits = pgTable(
  "user_metric_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }), // Associated user ID
    metricId: integer("metric_id").notNull(), // Metric ID
    code: text("code").notNull(), // Metric code
    metricName: text("metric_name").notNull(), // Metric name
    totalLimit: doublePrecision("total_limit").notNull(), // Total limit for the metric
    currentUsedValue: doublePrecision("current_used_value").notNull(), // Current used value for the metric
    createdAt: timestamp("created_at").notNull().defaultNow(), // Creation time
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()), // Update time
  },
  (table) => [
    index("user_metric_limits_user_id_idx").on(table.userId),
    index("user_metric_limits_metric_id_idx").on(table.metricId),
    index("user_metric_limits_code_idx").on(table.code)
  ]
);

export type UserMetricLimit = typeof userMetricLimits.$inferSelect;
export type NewUserMetricLimit = typeof userMetricLimits.$inferInsert;
