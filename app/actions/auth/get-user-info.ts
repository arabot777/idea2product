"use server";

import { getTranslations } from 'next-intl/server';

import { AppError } from "@/lib/types/app.error";
import { actionWithPermission } from "@/lib/permission/guards/action";
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AuthStatus } from "@/lib/types/permission/permission-config.dto";

const EmptyProfileDTO: ProfileDTO = {
  id: "",
  email: "",
  roles: [],
  username: null,
  full_name: null,
  avatar_url: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

/**
 * Get current logged-in user's profile information
 * Requires 'view_profile' permission
 */
export const getCurrentUserProfile = actionWithPermission("getCurrentUserProfile", async (userContext: UserContext): Promise<ProfileDTO> => {
  const t = await getTranslations('AuthGetUserInfo');
  if (!userContext.id || userContext.authStatus !== AuthStatus.AUTHENTICATED) {
    return EmptyProfileDTO;
  }
  try {
    const profile = await ProfileQuery.getById(userContext.id!);

    if (!profile) {
      return EmptyProfileDTO;
    }

    return ProfileMapper.toDTO(profile);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    throw new AppError("PROFILE_FETCH_FAILED", error.message || t('profileFetchFailed'));
  }
});
