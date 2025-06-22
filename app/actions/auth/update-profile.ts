"use server";

import { z } from "zod";
import { AppError } from "@/lib/types/app.error";
import { formActionWithPermission, actionWithPermission } from "@/lib/permission/guards/action";
import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AuthStatus } from "@/lib/types/permission/permission-config.dto";
import { getTranslations } from "next-intl/server";
import { RoleQuery } from "@/lib/db/crud/permission/role.query";

const updateProfileSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1, "Full name is required").max(255).optional(),
  avatar_url: z.string().url("Invalid URL format").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required").max(50).optional(),
  roles: z.string().optional(),
});

export const updateAccount = formActionWithPermission(
  "updateAccount",
  updateProfileSchema,
  async (data: z.infer<typeof updateProfileSchema>, formData: FormData, userContext: UserContext) => {
    const { full_name, avatar_url, username } = data;
    const t = await getTranslations("AuthUpdateProfile");

    if (userContext.authStatus !== AuthStatus.AUTHENTICATED) {
      throw new AppError("AUTH_REQUIRED", t("userNotAuthenticated"));
    }

    try {
      const existingProfile = await ProfileQuery.getById(userContext.id!);

      if (!existingProfile) {
        throw new AppError("PROFILE_NOT_FOUND", t("userProfileNotFound"));
      }

      const updatedProfileData: Partial<ProfileDTO> = {
        full_name: full_name !== undefined ? full_name : existingProfile.full_name,
        avatar_url: avatar_url !== undefined ? avatar_url : existingProfile.avatar_url,
        username: username !== undefined ? username : existingProfile.username,
      };

      const partialProfile = ProfileMapper.fromDTO(updatedProfileData as ProfileDTO); // Cast to ProfileDTO for mapper input

      const updateResult = await ProfileEdit.update(userContext.id!, partialProfile);

      if (!updateResult || updateResult.length === 0) {
        throw new AppError("PROFILE_UPDATE_FAILED", t("failedToUpdateProfile"));
      }

      const newProfile = await ProfileQuery.getById(userContext.id!);
      if (!newProfile) {
        throw new AppError("PROFILE_NOT_FOUND", t("updatedUserProfileNotFound"));
      }
      return ProfileMapper.toDTO(newProfile);
    } catch (error: any) {
      console.error("errorUpdatingProfile", error);
      throw new AppError("PROFILE_UPDATE_FAILED", error.message || t("failedToUpdateAccount"));
    }
  }
);

export const updateAccountByAdmin = formActionWithPermission(
  "updateAccountByAdmin",
  updateProfileSchema,
  async (data: z.infer<typeof updateProfileSchema>, formData: FormData, userContext: UserContext) => {
    const { full_name, avatar_url, username, roles } = data;
    const t = await getTranslations("AuthUpdateProfile");

    try {
      const existingProfile = await ProfileQuery.getById(formData.get("id") as string);

      if (!existingProfile) {
        throw new AppError("PROFILE_NOT_FOUND", t("userProfileNotFound"));
      }

      const updatedProfileData: Partial<ProfileDTO> = {
        full_name: full_name !== undefined ? full_name : existingProfile.full_name,
        avatar_url: avatar_url !== undefined ? avatar_url : existingProfile.avatar_url,
        username: username !== undefined ? username : existingProfile.username,
        roles: roles ? roles.split(",").map((role) => role.trim()) : existingProfile.roles,
      };

      const partialProfile = ProfileMapper.fromDTO(updatedProfileData as ProfileDTO); // Cast to ProfileDTO for mapper input

      const updateResult = await ProfileEdit.update(userContext.id!, partialProfile);

      if (!updateResult || updateResult.length === 0) {
        throw new AppError("PROFILE_UPDATE_FAILED", t("failedToUpdateProfile"));
      }

      try {
        const roleList = updatedProfileData.roles?.map((role) => role.trim());
        if (updatedProfileData?.roles && updatedProfileData.roles.length > 0) {
          const roles = await RoleQuery.getByNames(updatedProfileData.roles);
          if(roles.length > 0){
            const roleType = roles.map((role) => role.role_type);
            supabaseAuthProvider.updateUserRoles(userContext.id!, roleType);
          }
        }
      } catch (error: any) {
        
      }

      const newProfile = await ProfileQuery.getById(userContext.id!);
      if (!newProfile) {
        throw new AppError("PROFILE_NOT_FOUND", t("updatedUserProfileNotFound"));
      }
      return ProfileMapper.toDTO(newProfile);
    } catch (error: any) {
      console.error("errorUpdatingProfile", error);
      throw new AppError("PROFILE_UPDATE_FAILED", error.message || t("failedToUpdateAccount"));
    }
  }
);

export const deleteAccount = actionWithPermission("deleteAccount", async () => {
  const t = await getTranslations("AuthUpdateProfile");
  const { error } = await supabaseAuthProvider.signOut(); // Sign out the user first

  if (error) {
    throw new AppError("AUTH_SIGN_OUT_FAILED", error.message || t("failedToSignOutBeforeAccountDeletion"));
  }

  // In a real application, you would typically have a backend endpoint
  // to handle the actual deletion of user data from your database.
  // For this example, we'll just redirect after sign out.
  // You might also want to call a server-side function to delete the profile from your DB.
  // Example: await ProfileEdit.delete(user.id);

  throw new AppError("NOT_IMPLEMENTED", t("accountDeletionNotImplemented"));
});
