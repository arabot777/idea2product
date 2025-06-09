import { z } from 'zod';
import { TaskStatus } from './enum.bean';

export const TaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  parentTaskId: z.string().uuid().nullable(),
  type: z.string(),
  status: z.nativeEnum(TaskStatus),
  title: z.string().nullable(),
  description: z.string().nullable(),
  progress: z.number().int(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  checkedAt: z.string().datetime().nullable(),
  checkInterval: z.number().int(),
  message: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskDto = z.infer<typeof TaskSchema>;