import { createClient } from '@supabase/supabase-js';
import { AuthError, Session, User } from '@supabase/supabase-js';

export class OAuthProvider {
  private supabase;

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
    }
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'discord'): Promise<{ url: string | null; error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      },
    });
    return { url: data.url, error };
  }

  // Other OAuth-related methods can be added here, such as handling callbacks
}

export const oauthProvider = new OAuthProvider();