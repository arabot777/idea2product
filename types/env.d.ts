// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PRIVATE_SUPABASE_SERVICE_KEY: string;
    // Add other environment variables here
  }
}