"use server";

import { getTranslations } from "next-intl/server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AppError } from "@/lib/types/app.error";
import { formActionWithPermission, dataActionWithPermission } from "@/lib/permission/guards/action";
import { supabaseAuthProvider } from "@/lib/auth/providers/supabase.provider";
import { ProfileMapper } from "@/lib/mappers/auth/profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { NewProfile } from "@/lib/db/schemas/auth/profile";
import { unibeeSyncUser } from "@/app/actions/unibee/unibee-sync-user";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(3, "Email is required").max(255, "Email is too long"),
  password: z.string().min(8, "Password must contain at least 8 characters").max(100, "Password is too long"),
});

export const signIn = formActionWithPermission("sign_in", signInSchema, async (data: z.infer<typeof signInSchema>, formData: FormData) => {
  const t = await getTranslations("AuthSignIn");
  const { email, password } = data;

  const { user, error } = await supabaseAuthProvider.signInWithPassword(email, password);

  if (error) {
    throw new AppError("AUTH_SIGN_IN_FAILED", error.message || t("signIn.failed"), { email });
  }

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    const priceId = formData.get("priceId") as string;
    console.warn("Checkout redirect in signIn needs review after Supabase migration due to team data dependency.");
  }

  if (!user) {
    throw new AppError("AUTH_UNKNOWN_ERROR", t("signIn.noUser"));
  }

  // Create or update user Profile
  let profileDTO: ProfileDTO;
  try {
    // Check if profile already exists
    const existingProfile = await ProfileQuery.getById(user.id);

    if (!existingProfile) {
      const profileData: Partial<NewProfile> = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        roles: [],
        unibeeExternalId: undefined,
      };
      await unibeeSyncUser(profileData).catch((error) => {
        console.error("unibeeSyncUser error", error);
      });
      // Otherwise create a new profile
      const [createdProfile] = await ProfileEdit.create(profileData as NewProfile);
      profileDTO = ProfileMapper.toDTO(createdProfile);
    }else{
      await unibeeSyncUser(existingProfile).catch((error) => {
        console.error("unibeeSyncUser error", error);
      });
    }
  } catch (profileError: any) {
    throw new AppError("AUTH_PROFILE_CREATION_FAILED", `${t("signIn.profileCreationFailed")}${profileError.message}`, {
      userId: user.id,
      email: user.email,
    });
  }

  return {
    success: true,
  };
});

const oAuthSignInSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export const signInWithOAuth = dataActionWithPermission("oauth_sign_in", async (data: z.infer<typeof oAuthSignInSchema>) => {
  const t = await getTranslations("AuthSignIn");
  const { provider } = data;

  const redirectToUrl = `${process.env.NEXT_PUBLIC_URL}/auth/callback`;
  const { data: authData, error } = await supabaseAuthProvider.signInWithOAuth(provider, redirectToUrl);

  if (error) {
    throw new AppError("AUTH_OAUTH_SIGN_IN_FAILED", `${t("oauth.signInFailed")}${provider}.`, error.message);
  }

  if (authData.url) {
    redirect(authData.url);
  } else {
    throw new AppError("AUTH_OAUTH_URL_MISSING", `${t("oauth.urlMissing")}${provider}.`);
  }
});
