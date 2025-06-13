"use server";

import { SupabaseClient, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { AuthStatus, ActiveStatus } from "@/lib/types/permission/permission-config.dto";
import { cookies } from "next/headers";
import { cache } from "@/lib/cache";
import { CacheKeys, CacheTags } from "@/lib/cache/keys";
import crypto from "crypto";

// Cache time (5 minutes)
const SESSION_CACHE_TTL = 30 * 60 * 1000;
const UN_USER_CONTEXT = {
  id: null,
  roles: [],
  authStatus: AuthStatus.ANONYMOUS,
  activeStatus: ActiveStatus.INACTIVE,
};

function calculateMD5(data: string) {
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("hex");
}

async function calculateCookieMD5(supabase: SupabaseClient) {
  const cookieStore = await cookies();
  // Extract the subdomain from the Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const subdomain = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "";
  // Get all subdomain cookies and sort them
  const subdomainCookies = Array.from(cookieStore.getAll())
    .filter((cookie) => cookie.name.startsWith(`sb-${subdomain}`))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Combine into key-value string for MD5 calculation
  const cookieString = subdomainCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("&");

  return cookieString ? calculateMD5(cookieString) : null;
}

// Get user information from session
export async function getCachedUser(supabase?: SupabaseClient): Promise<{ userContext: UserContext; user: Session["user"] | null }> {
  try {
    const supabaseClient = supabase || (await createClient());

    // 1. Attempt to refresh the session.
    // This will use the refresh token (typically stored in cookies if using auth-helpers)
    // to get a new access token and session details.
    // If successful, the Supabase client (if configured with auth-helpers)
    // should automatically update the cookies with the new session information.
    const cookieMD5 = await calculateCookieMD5(supabaseClient);
    const cookieMD5Key = CacheKeys.COOKIE_MD5(cookieMD5 || "");
    const cookieMD5Value = await cache.get(cookieMD5Key);

    let refreshedSession: any = null;
    let refreshError = null;
    if (cookieMD5Value) {
      refreshedSession = cookieMD5Value;
    } else {
      // Get current session information
      const {
        data: { session: currentSession },
      } = await supabaseClient.auth.getSession();
      refreshedSession = currentSession;
      if (refreshedSession) {
        await cache.set(
          cookieMD5Key,
          {
            expires_at: refreshedSession.expires_at,
            user: refreshedSession.user,
          },
          SESSION_CACHE_TTL
        );
      }
    }
    // Check if session refresh is needed
    // Refresh session if it doesn't exist or if the refresh token expires within 10 minutes
    const needsRefresh =
      !refreshedSession || (refreshedSession.expires_at && new Date(refreshedSession.expires_at * 1000).getTime() - Date.now() < 10 * 60 * 1000);

    if (needsRefresh) {
      const refreshResult = await supabaseClient.auth.refreshSession();
      refreshedSession = refreshResult.data.session;
      refreshError = refreshResult.error;

      if (refreshError) {
        return { userContext: UN_USER_CONTEXT, user: null };
      }
      await cache.set(cookieMD5Key, refreshedSession, SESSION_CACHE_TTL);
    }

    if (!refreshedSession) {
      // console.log("No session found after attempting refresh. User is unauthenticated.");
      return { userContext: UN_USER_CONTEXT, user: null };
    }

    // At this point, `refreshedSession` is the current, valid session.
    // Cookies should have been updated by the Supabase client if using auth-helpers.

    // 2. Check if the (potentially) refreshed session is actually valid and not expired.
    const now = Date.now();
    const sessionExpiresAt = refreshedSession.expires_at ? refreshedSession.expires_at * 1000 : 0;

    if (!sessionExpiresAt || sessionExpiresAt < now) {
      console.warn("Session is expired even after a successful refresh call, or expiry is invalid. Treating as unauthenticated.");
      return { userContext: UN_USER_CONTEXT, user: null };
    }

    // 3. Session is valid. Proceed to get user profile from cache or database.
    const userId = refreshedSession.user.id;
    const cachedUserContext = await cache.get<UserContext>(CacheKeys.USER_PROFILE(userId));

    if (cachedUserContext) {
      return {
        userContext: cachedUserContext,
        user: refreshedSession.user,
      };
    } else {
      console.log("User not found in cache, fetching from database...");
      // Since userId is used here, ensure it's valid to guarantee core permission validation data originates from the database and follows the validation process.
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user || !user.user) {
        console.warn("User not found after session refresh. Treating as unauthenticated.");
        return { userContext: UN_USER_CONTEXT, user: null };
      }
      const userProfile = await ProfileQuery.getById(user.user.id);
      // Construct userContext ensuring all fields align with the UserContext type definition
      const userContextData = {
        id: userId,
        roles: userProfile?.roles || [],
        authStatus: AuthStatus.AUTHENTICATED,
        activeStatus: userProfile?.active_2fa ? ActiveStatus.ACTIVE_2FA : userProfile?.email_verified ? ActiveStatus.ACTIVE : ActiveStatus.INACTIVE,
        email: userProfile?.email || refreshedSession.user.email,
        subscription: userProfile?.subscription || [], // Matches original logic for subscription
        unibeeExternalId: userProfile?.unibeeExternalId || undefined,
      };
      const userContext: UserContext = userContextData;

      await cache.set(CacheKeys.USER_PROFILE(userId), userContext, SESSION_CACHE_TTL);
      return {
        userContext,
        user: refreshedSession.user,
      };
    }
  } catch (error: any) {
    console.error("Unexpected error in getCachedUser:", error.message || error);
    return { userContext: UN_USER_CONTEXT, user: null };
  }
}

// Clear user session cache
export async function clearUserCache() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
