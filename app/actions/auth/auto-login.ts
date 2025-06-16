"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types/api.bean";
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { NewProfile } from "@/lib/db/schemas/auth/profile";
import { getTranslations } from 'next-intl/server';
import { unibeeSyncUser } from "@/app/actions/unibee/unibee-sync-user";

const t = await getTranslations('AuthAutoLogin');

export async function autoLogin(
  prevState: ActionState,
  loginData: {
    type: string;
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
  }
): Promise<ActionState> {
  if (!loginData || !loginData.type) {
    return {
      error: {
        code: "LOGIN_FAILED",
        message: t('typeRequired'),
      },
    };
  }
  let authData: any | undefined;
  let authError: any | undefined;
  const client = await createClient();
  if (loginData.type === "social-google" || loginData.type === "social-github") {
    if (loginData.access_token && loginData.refresh_token){
      const { data: _authData, error: _authError } = await client.auth.setSession({
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
      });
      authData = _authData;
      authError = _authError;
    }else if(loginData.code){
      const { data: _authData, error: _authError } = await client.auth.exchangeCodeForSession(loginData.code);
      authData = _authData;
      authError = _authError;
    }
  } else {
    if (!loginData.token_hash || loginData.type !== "email") {
      return {
        error: {
          code: "LOGIN_FAILED",
          message: t('invalidAutoLoginParameters'),
        },
      };
    }
    const { data: _authData, error: _authError } = await client.auth.verifyOtp({
      type: "email",
      token_hash: loginData.token_hash,
    });
    authData = _authData;
    authError = _authError;
  }
  if (authError) {
    return {
      error: {
        code: "LOGIN_FAILED",
        message: authError.message || t('autoLoginFailed'),
      },
    };
  }

  // Create or update user Profile
  let profileDTO: ProfileDTO;
  try {
    // Check if profile already exists
    const existingProfile = await ProfileQuery.getById(authData.user.id);

    const profileData: Partial<NewProfile> = {
      id: authData.user.id,
      email: authData.user.email,
      full_name: authData.user.user_metadata.full_name,
      roles: [],
      unibeeExternalId: undefined,
    };

    if (existingProfile) {
      await unibeeSyncUser(existingProfile).catch((error) => {
        console.error("unibeeSyncUser error", error);
      });
      // If profile exists, update it
      const [updatedProfile] = await ProfileEdit.update(authData.user.id, profileData);
      profileDTO = ProfileMapper.toDTO(updatedProfile);
    } else {
      await unibeeSyncUser(profileData).catch((error) => {
        console.error("unibeeSyncUser error", error);
      });
      // Otherwise create a new profile
      const [createdProfile] = await ProfileEdit.create(profileData as NewProfile);
      profileDTO = ProfileMapper.toDTO(createdProfile);
    }
  } catch (profileError: any) {
    return {
      error: {
        code: "LOGIN_FAILED",
        message: `${t('profileOperationFailed')}${profileError.message}`,
      },
    };
  }

  return {
    success: true,
    profile: profileDTO,
  };
}
