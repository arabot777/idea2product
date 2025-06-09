// lib/auth/session-cache.ts
import { SupabaseClient, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { ProfileQuery } from "@/lib/db/crud/auth/profile.query";
import { AuthStatus, ActiveStatus } from "@/lib/types/permission/permission-config.dto";

// Dynamically import cache module only in server environment
// CacheKeys type is not imported here to avoid naming conflicts

// Define in-memory cache for middleware environment
const memoryCache = new Map<string, { value: any; expires: number }>();

// Detect if running in a middleware environment
const isMiddlewareRuntime = typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge";

// Simple caching utility for middleware environment
const simpleCache = {
  async get<T>(key: string): Promise<T | undefined> {
    const item = memoryCache.get(key);
    if (!item) return undefined;

    if (item.expires && item.expires < Date.now()) {
      memoryCache.delete(key);
      return undefined;
    }

    return item.value as T;
  },
  async set(key: string, value: any, ttl: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl : 0;
    memoryCache.set(key, { value, expires });
  },
  async del(key: string): Promise<void> {
    memoryCache.delete(key);
  },
};

// Initialize cache and cache keys
let cache: typeof simpleCache;
let CacheKeys: any;

// Import actual cache implementation only in non-middleware environments
if (!isMiddlewareRuntime) {
  const cacheImport = require("@/lib/cache");
  const keysImport = require("@/lib/cache/keys");
  cache = cacheImport.cache;
  CacheKeys = keysImport.CacheKeys;
} else {
  // Middleware environment uses simplified implementation
  cache = simpleCache;
  CacheKeys = {
    USER_PROFILE: (id: string) => `user_profile:${id}`,
  };
}

// Cache time (5 minutes)
const SESSION_CACHE_TTL = 5 * 60 * 1000;
const UN_USER_CONTEXT = {
  id: null,
  roles: [],
  authStatus: AuthStatus.ANONYMOUS,
  activeStatus: ActiveStatus.INACTIVE,
};

// Get user information from session
export async function getCachedUser(supabase?: SupabaseClient): Promise<{ userContext: UserContext; user: Session["user"] | null }> {
  try {
    const supabaseClient = supabase || (await createClient());

    // 1. Attempt to refresh the session.
    // This will use the refresh token (typically stored in cookies if using auth-helpers)
    // to get a new access token and session details.
    // If successful, the Supabase client (if configured with auth-helpers)
    // should automatically update the cookies with the new session information.

    // Get current session information
    const {
      data: { session: currentSession },
    } = await supabaseClient.auth.getSession();

    // Check if session refresh is needed
    // Refresh session if it doesn't exist or if the refresh token expires within 10 minutes
    const needsRefresh = !currentSession || (currentSession.expires_at && new Date(currentSession.expires_at * 1000).getTime() - Date.now() < 10 * 60 * 1000);

    // Refresh session only when needed
    let refreshedSession = currentSession;
    let refreshError = null;

    if (needsRefresh) {
      const refreshResult = await supabaseClient.auth.refreshSession();
      refreshedSession = refreshResult.data.session;
      refreshError = refreshResult.error;

      if (refreshError) {
        console.warn(`Session refresh failed: ${refreshError.message}. User will be treated as unauthenticated.`);
        return { userContext: UN_USER_CONTEXT, user: null };
      }
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
