import { z } from 'zod';

export const TaskDataSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  inputData: z.string().nullable(),
  outputData: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskDataDto = z.infer<typeof TaskDataSchema>;