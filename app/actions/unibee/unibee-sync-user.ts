"use server";

import { AppError } from "@/lib/types/app.error";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { UnibeanClient } from "@/lib/unibean/client";
import { ProfileEdit } from "@/lib/db/crud/auth/profile.edit";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";

export const unibeeSyncUser = async (userContext: UserContext): Promise<void> => {
  try {
    if (!userContext.id || !userContext.email) {
      throw new AppError("VALIDATION_ERROR", "unibeeSyncUser.validationError");
    }
    if (userContext.unibeeExternalId) return;
    const sessionResponse = await UnibeanClient.getInstance().createClientSession({
      email: userContext.email,
      externalUserId: userContext.id,
    });

    if (sessionResponse.code !== 0) {
      throw new AppError("UNIBEE_API_ERROR", "unibeeSyncUser.unibeeApiError", sessionResponse.message);
    }
    userContext.unibeeExternalId = sessionResponse.data.userId;
    await ProfileEdit.update(userContext.id || "", { unibeeExternalId: sessionResponse.data.userId });
    await cache.set(CacheKeys.USER_PROFILE(userContext.id || ""), userContext, 30 * 60 * 1000);
  } catch (error: any) {
    console.error("unibeeSyncUser error", error);
  }
};
