'use server';

import { redirect } from 'next/navigation';
import { supabaseAuthProvider } from '@/lib/auth/providers/supabase.provider';

export const signOut = async () => {
  await supabaseAuthProvider.signOut();
  redirect('/login');
};