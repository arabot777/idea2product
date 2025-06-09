import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | undefined;
  name: string | undefined;
}

interface AuthHook {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null; // Add session property
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<{ success: boolean; error: string | null }>;
}

export const useAuth = (): AuthHook => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add session state
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAuthenticated(true);
        setSession(data.session); // Set session
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || data.session.user.email,
        });
      } else {
        setIsAuthenticated(false);
        setSession(null); // Clear session
        setUser(null);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      if (newSession) {
        setIsAuthenticated(true);
        setSession(newSession); // Update session
        setUser({
          id: newSession.user.id,
          email: newSession.user.email,
          name: newSession.user.user_metadata?.full_name || newSession.user.email,
        });
      } else {
        setIsAuthenticated(false);
        setSession(null); // Clear session
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
    if (data.user) {
      setIsAuthenticated(true);
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email,
      });
      return { success: true, error: null };
    }
    return { success: false, error: 'Unknown login error' };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return { success: false, error: error.message };
    }
    setIsAuthenticated(false);
    setUser(null);
    return { success: true, error: null };
  };

  return {
    isAuthenticated,
    user,
    session, // Include session in the returned object
    login,
    logout,
  };
};
