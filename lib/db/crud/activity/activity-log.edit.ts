import { db } from '@/lib/db/drizzle';
import { activityLogs, NewActivityLog } from '@/lib/db/schemas/activity/activity-log';
import { eq } from 'drizzle-orm';

export class ActivityLogEdit {
  static async create(activityLog: NewActivityLog) {
    return await db.insert(activityLogs).values(activityLog).returning();
  }

  static async update(id: string, activityLog: Partial<NewActivityLog>) {
    return await db.update(activityLogs).set(activityLog).where(eq(activityLogs.id, id)).returning();
  }

  static async delete(id: string) {
    return await db.delete(activityLogs).where(eq(activityLogs.id, id)).returning();
  }
}