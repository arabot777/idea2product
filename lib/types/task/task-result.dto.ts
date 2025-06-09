import { z } from 'zod';
import { TaskResultStatus, TaskResultType } from './enum.bean';

export const TaskResultSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  taskId: z.string().uuid(),
  parentTaskId: z.string().uuid().nullable(),
  type: z.nativeEnum(TaskResultType),
  status: z.nativeEnum(TaskResultStatus),
  message: z.string().nullable(),
  content: z.string().nullable(),
  storageUrl: z.string().nullable(),
  mimeType: z.string().nullable(),
  width: z.string().nullable(),
  height: z.string().nullable(),
  duration: z.string().nullable(),
  fileMimeType: z.string().nullable(),
  fileSize: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskResultDto = z.infer<typeof TaskResultSchema>;