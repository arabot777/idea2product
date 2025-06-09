import { z } from 'zod';

/**
 * @description User type, should extend from Supabase's User type.
 *              Common user fields are defined here. When actually used, adjustments should be made according to Supabase's specific User structure.
 *              Database-specific fields, such as internal fields in `raw_user_meta_data` or `app_metadata`, have been removed.
 */
export const UserSchema = z.object({
  id: z.string().uuid().describe('Unique user ID'),
  email: z.string().email().describe('User email'),
  // Assuming Supabase User type includes these fields, simplified and typed here
  // In actual applications, it can be extended based on Supabase's specific User type
  // e.g., z.infer<typeof SupabaseUserSchema>.extend({ ... })
  email_confirmed_at: z.string().datetime().optional().describe('Email confirmation time'),
  phone: z.string().optional().describe('User phone number'),
  phone_confirmed_at: z.string().datetime().optional().describe('Phone confirmation time'),
  created_at: z.string().datetime().describe('User creation time'),
  updated_at: z.string().datetime().optional().describe('User update time'),
  last_sign_in_at: z.string().datetime().optional().describe('Last sign-in time'),
  aud: z.string().optional().describe('Audience'),
  role: z.string().optional().describe('User role'),
  // Example: profile field, can be extended based on actual business requirements
  full_name: z.string().optional().describe('User full name'),
  avatar_url: z.string().url().optional().describe('User avatar URL'),
});
export type User = z.infer<typeof UserSchema>;