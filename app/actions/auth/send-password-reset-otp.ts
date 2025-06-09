'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionState } from '@/lib/types/api.bean';
import { getTranslations } from 'next-intl/server';

export async function sendPasswordResetOtp(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = await getTranslations('AuthSendPasswordResetOtp');
  const email = formData.get('email') as string;

  if (!email) {
    return {
      error: {
        code: 'MISSING_EMAIL',
        message: t('emailRequired')
      }
    };
  }

  const supabase = await createClient();
  // Using signInWithOtp for password reset flow, as per Supabase documentation for OTP based password reset
  // The type 'email' is used for sending OTP to email.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/forgot-password` // This redirect is for the link, but we'll use the OTP directly
  });

  if (error) {
    return {
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || t('unexpectedError')
      }
    };
  }

  return {
    success: t('otpSentSuccess'),
    email: email // Return email to persist it in the form
  };
}