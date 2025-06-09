"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AppError } from "@/lib/types/app.error";
import { getTranslations } from 'next-intl/server';
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { formActionWithPermission } from "@/lib/permission/guards/action";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { NewProfile } from "@/lib/db/schemas/auth/profile";

// Registration schema validation
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(3, "Email is required").max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .max(100, "Password is too long"),
  name: z.string().min(2, "Name must contain at least 2 characters").max(100, "Name is too long"),
});

type RegisterParams = z.infer<typeof registerSchema>;

/**
 * User registration action
 * @param params Registration parameters (email, password, name)
 * @returns Registration result
 */
export const register = formActionWithPermission(
  "register_user",
  registerSchema,
  async (data: RegisterParams, formData: FormData): Promise<any> => {
    const t = await getTranslations('AuthRegisterUser');
    const { email, password, name } = data;

    // Use supabaseAuthProvider for registration
    const { user, error } = await supabaseAuthProvider.signUp(email, password);

    if (error) {
      if (error.message.includes("User already registered")) {
        throw new AppError("AUTH_USER_ALREADY_REGISTERED", t('errors.emailAlreadyRegisteredMessage'), { email });
      } else {
        throw new AppError("AUTH_SIGN_UP_FAILED", error.message || t('errors.registrationFailed'), { email });
      }
    }

    if (!user) {
      throw new AppError("AUTH_UNKNOWN_ERROR", t('errors.noUserInfoRetrieved'));
    }

    // Create or update user Profile
    let profileDTO: ProfileDTO;
    try {
      // Check if profile already exists
      const existingProfile = await ProfileQuery.getById(user.id);
      
      const profileData: Partial<NewProfile> = {
        id: user.id,
        email: user.email,
        full_name: name,
        roles: [],
      };

      if (existingProfile) {
        // If profile exists, update it
        const [updatedProfile] = await ProfileEdit.update(user.id, profileData);
        profileDTO = ProfileMapper.toDTO(updatedProfile);
      } else {
        // Otherwise create a new profile
        const [createdProfile] = await ProfileEdit.create(profileData as NewProfile);
        profileDTO = ProfileMapper.toDTO(createdProfile);
      }
    } catch (profileError: any) {
      throw new AppError("AUTH_PROFILE_CREATION_FAILED", `${t('errors.profileOperationFailedPrefix')}${profileError.message}`, { userId: user.id, email: user.email });
    }

    return {
      success: true,
    };
  }
);

/**
 * Verify email
 * @param token Verification token
 * @returns Verification result
 */
export const verifyEmail = formActionWithPermission(
  "verify_email",
  z.object({ token: z.string() }),
  async (data: { token: string }, formData: FormData): Promise<boolean> => {
    const t = await getTranslations('AuthRegisterUser');
    const { token } = data;
    if (!token) {
      throw new AppError("AUTH_VERIFY_FAILED", t('errors.invalidToken'));
    }
    const { error } = await supabaseAuthProvider.verifyEmail(token);
    if (error) {
      throw new AppError("AUTH_VERIFY_FAILED", error.message || t('errors.emailVerificationFailed'), error);
    }
    return true;
  }
);
