import { SupabaseClient } from "@supabase/supabase-js";

import { AuthError, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export class SupabaseAuthProvider {
  private supabase?: SupabaseClient;

  constructor() {
  }

  async initSupabase() {
    if (this.supabase) return this.supabase;
    this.supabase = await createClient();
  }

  async signInWithPassword(email: string, password: string): Promise<{ session: Session | null; user: User | null; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.signInWithPassword({ email, password });
    return { session: data.session, user: data.user, error };
  }

  async signUp(email: string, password: string): Promise<{ session: Session | null; user: User | null; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.signUp({ email, password });
    return { session: data.session, user: data.user, error };
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      await this.initSupabase();
      // Call Supabase logout first
      const { error } = await this.supabase!.auth.signOut();
      
      // Manually clear all related cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          // Delete all Supabase related cookies
          if (name.startsWith('sb-') || name === 'sb-auth-token') {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          }
        }
        
        // Clear Supabase related data from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log("signOut completed", error);
      return { error };
    } catch (err) {
      console.error("Error during sign out:", err);
      return { error: err as AuthError };
    }
  }

  async verifyEmail(token: string): Promise<{ error: AuthError | null }> {
    await this.initSupabase();
    const { error } = await this.supabase!.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });
    return { error };
  }

  async deleteUser(userId: string): Promise<{ error: AuthError | null }> {
    await this.initSupabase();
    const { error } = await this.supabase!.auth.admin.deleteUser(userId);
    return { error };
  }

  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    await this.initSupabase();
    const { error } = await this.supabase!.auth.resetPasswordForEmail(email);
    return { error };
  }

  async refreshSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.refreshSession();
    return { data, error };
  }

  async updateUser(attributes: Partial<User>): Promise<{ data: { user: User | null }; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.updateUser(attributes);
    return { data, error };
  }

  async updatePassword(newPassword: string): Promise<{ user: User | null; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.updateUser({ password: newPassword });
    return { user: data.user, error };
  }

  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.getSession();
    return { session: data.session, error };
  }

  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.getUser();
    return { user: data.user, error };
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<{ error: AuthError | null }> {
    await this.initSupabase();
    const { error } = await this.supabase!.auth.admin.updateUserById(userId, { role: roles.join(",") });
    return { error };
  }

  async signInWithOAuth(provider: 'google' | 'github', redirectTo: string): Promise<{ data: { url: string | null }; error: AuthError | null }> {
    await this.initSupabase();
    const { data, error } = await this.supabase!.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
    return { data, error };
  }
}

export const supabaseAuthProvider = new SupabaseAuthProvider();