import { pgTable, text, timestamp, doublePrecision, uuid } from 'drizzle-orm/pg-core';

export const usageRecords = pgTable('usage_records', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  meterId: text('meter_id').notNull(),
  value: doublePrecision('value').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});