"use server";

import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY!, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        // Do not set any cookies
      },
    },
  });
}
