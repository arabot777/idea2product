import { pgTable, uuid, text, timestamp, jsonb, pgEnum, index, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";

export const billableMetrics = pgTable(
  "billable_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unibeeExternalId: text("unibee_external_id"),
    code: text("code").notNull(),
    metricName: text("metric_name").notNull(),
    metricDescription: text("metric_description"),
    aggregationProperty: text("aggregation_property"),
    aggregationType: integer("aggregation_type").notNull(), // 1-count, 2-count unique, 3-latest, 4-max, 5-sum
    type: integer("type").notNull(), // 1-limit_metered, 2-charge_metered, 3-charge_recurring
    // billable_metrics are used by unibee for counting, but depending on different features,
    // the system needs to convert to a relatively uniform pricing basis,
    // featureCalculator is a tool used within the system to calculate the basis through parameter adjustment or return parameters
    featureCalculator: text("feature_calculator").notNull(),
    // displayDescription is used for display in the UI
    displayDescription: text("display_description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("billable_metrics_code_idx").on(table.code)]
);

export type BillableMetric = typeof billableMetrics.$inferSelect;
export type NewBillableMetric = typeof billableMetrics.$inferInsert;
