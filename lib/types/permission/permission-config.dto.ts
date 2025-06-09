import { z } from 'zod';

// Permission-related enum definitions
export const AuthStatus = {
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated',
} as const;

export const ActiveStatus = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ACTIVE_2FA: 'active_2fa',
} as const;

export const RejectAction = {
  HIDE: 'hide',
  DISABLE: 'disable',
  REDIRECT: 'redirect',
  THROW: 'throw',
} as const;

export const PermissionScope = {
  PAGE: 'page',
  API: 'api',
  ACTION: 'action',
  COMPONENT: 'component',
} as const;

// Type exports
export type AuthStatusType = typeof AuthStatus[keyof typeof AuthStatus];
export type ActiveStatusType = typeof ActiveStatus[keyof typeof ActiveStatus];
export type RejectActionType = typeof RejectAction[keyof typeof RejectAction];
export type PermissionScopeType = typeof PermissionScope[keyof typeof PermissionScope];

export const PermissionConfigSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  target: z.string(),
  scope: z.nativeEnum(PermissionScope),
  auth_status: z.nativeEnum(AuthStatus),
  active_status: z.nativeEnum(ActiveStatus),
  subscription_types: z.array(z.string()),
  reject_action: z.nativeEnum(RejectAction),
  title: z.string().nullable(),
  description: z.string().nullable(),
});

export type PermissionConfigDto = z.infer<typeof PermissionConfigSchema>;
export type PartialPermissionConfigDto = Partial<PermissionConfigDto>;