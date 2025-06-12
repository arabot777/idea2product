import { z } from 'zod';

export const UserMetricLimitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  code: z.string(),
  metricName: z.string(),
  totalLimit: z.number(),
  currentUsedValue: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserMetricLimitDto = z.infer<typeof UserMetricLimitSchema>;