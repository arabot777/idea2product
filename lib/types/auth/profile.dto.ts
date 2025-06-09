import { z } from 'zod';

export const ProfileDTOSchema = z.object({
  id: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  username: z.string().nullable(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type ProfileDTO = z.infer<typeof ProfileDTOSchema>;