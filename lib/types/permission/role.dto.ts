import { z } from 'zod';


// Permission-related enum definitions
export const RoleType = {
  USER: 'user',
  TEAM_USER: 'team_user',
  TEAM_ADMIN: 'team_admin',
  SYSTEM_ADMIN: 'system_admin',
} as const;

export type RoleTypeType = typeof RoleType[keyof typeof RoleType];


export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role_type: z.nativeEnum(RoleType), // roleTypeEnum
  description: z.string().nullable(),
});

export type RoleDto = z.infer<typeof RoleSchema>;