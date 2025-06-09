import { z } from 'zod';

export const RolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export type RolePermissionDto = z.infer<typeof RolePermissionSchema>;