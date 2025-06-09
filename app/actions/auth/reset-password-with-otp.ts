'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionState } from '@/lib/types/api.bean';
import { getTranslations } from 'next-intl/server';

export async function resetPasswordWithOtp(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = await getTranslations('AuthResetPasswordWithOtp');
  const email = formData.get('email') as string;
  const token = formData.get('token') as string; // OTP is referred to as token in verifyOtp
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !token || !password || !confirmPassword) {
    return {
      error: {
        code: 'MISSING_FIELDS',
        message: t('all_fields_required')
      }
    };
  }

  if (password !== confirmPassword) {
    return {
      error: {
        code: 'PASSWORD_MISMATCH',
        message: t('passwords_do_not_match')
      }
    };
  }

  const supabase = await createClient();

  // Verify the OTP
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery' // Type of OTP, 'email' for email OTP
  });

  if (verifyError) {
    return {
      error: {
        code: verifyError.code || 'INVALID_OTP',
        message: verifyError.message || t('invalid_or_expired_otp')
      }
    };
  }

  // If OTP is verified, update the user's password
  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  });

  if (updateError) {
    return {
      error: {
        code: updateError.code || 'PASSWORD_UPDATE_FAILED',
        message: updateError.message || t('failed_to_update_password')
      }
    };
  }

  // Sign out the user to force them to log in with the new password
  await supabase.auth.signOut();

  return {
    success: t('password_reset_successfully')
  };
}