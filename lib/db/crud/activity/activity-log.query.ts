import { db } from '@/lib/db/drizzle';
import { activityLogs, ActivityLog } from '@/lib/db/schemas/activity/activity-log';
import { eq, and, like, desc } from 'drizzle-orm';

export class ActivityLogQuery {
  static async getById(id: string): Promise<ActivityLog | undefined> {
    return await db.query.activityLogs.findFirst({
      where: eq(activityLogs.id, id),
    });
  }

  static async getByUserId(userId: string): Promise<ActivityLog[]> {
    return await db.query.activityLogs.findMany({
      where: eq(activityLogs.userId, userId),
      orderBy: [desc(activityLogs.timestamp)],
    });
  }

  static async search(
    searchTerm?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ActivityLog[]> {
    const conditions = [];
    if (searchTerm) {
      conditions.push(like(activityLogs.action, `%${searchTerm}%`));
    }

    return await db.query.activityLogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(activityLogs.timestamp)],
    });
  }

  static async getAll(limit: number = 10, offset: number = 0): Promise<ActivityLog[]> {
    return await db.query.activityLogs.findMany({
      limit,
      offset,
      orderBy: [desc(activityLogs.timestamp)],
    });
  }
}