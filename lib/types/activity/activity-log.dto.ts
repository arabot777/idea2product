import { z } from 'zod';

export const ActivityLogDTOSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  action: z.string(),
  timestamp: z.date(),
  ipAddress: z.string().nullable(),
});

export type ActivityLogDTO = z.infer<typeof ActivityLogDTOSchema>;