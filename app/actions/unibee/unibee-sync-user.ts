"use server";

import { AppError } from "@/lib/types/app.error";
import { UnibeanClient } from "@/lib/unibean/client";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";

export const unibeeSyncUser = async (profile: { id?: string | null; email?: string | null; unibeeExternalId?: string | null }): Promise<void> => {
  try {
    if (!profile.id || !profile.email) {
      throw new AppError("VALIDATION_ERROR", "unibeeSyncUser.validationError");
    }
    if (profile.unibeeExternalId) return;
    const sessionResponse = await UnibeanClient.getInstance().createClientSession({
      email: profile.email,
      externalUserId: profile.id,
    });

    if (sessionResponse.code !== 0) {
      throw new AppError("UNIBEE_API_ERROR", "unibeeSyncUser.unibeeApiError", sessionResponse.message);
    }
    profile.unibeeExternalId = sessionResponse.data.userId;
    await ProfileEdit.update(profile.id || "", { unibeeExternalId: sessionResponse.data.userId });
  } catch (error: any) {
    console.error("unibeeSyncUser error", error);
  }
};
