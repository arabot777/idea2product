'use server';

import { getTranslations } from 'next-intl/server';

import { z } from 'zod';
import { supabaseAuthProvider } from '@/lib/auth/providers/supabase.provider';
import { AppError } from '@/lib/types/app.error';
import { withPermission } from '@/lib/permission/guards/action';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'; // For OTP verification

const requestPasswordResetSchema = z.object({
  email: z.string().email('auth_reset_password.email_invalid').min(1, 'auth_reset_password.email_required')
});

export const requestPasswordReset = withPermission(
  'request_password_reset',
  async (data: z.infer<typeof requestPasswordResetSchema>) => {
    const { email } = data;
    const t = await getTranslations('AuthResetPassword');

    const redirectTo = `${process.env.NEXT_PUBLIC_URL}/reset-password`;

    const { error } = await supabaseAuthProvider.resetPasswordForEmail(email);

    if (error) {
      throw new AppError(
        'AUTH_PASSWORD_RESET_REQUEST_FAILED',
        error.message || t('password_reset_request_failed'),
        { email }
      );
    }

    return {
      message: t('password_reset_link_sent'),
      email
    };
  }
);

const updatePasswordFromResetSchema = z.object({
  token_hash: z.string().min(1, 'auth_reset_password.reset_token_required'),
  password: z.string().min(8, 'auth_reset_password.password_min_length'),
  confirmPassword: z.string().min(8, 'auth_reset_password.confirm_password_required')
});

export const updatePasswordFromReset = withPermission(
  'update_password_from_reset',
  async (data: z.infer<typeof updatePasswordFromResetSchema>) => {
    const { token_hash, password, confirmPassword } = data;
    const t = await getTranslations('AuthResetPassword');

    if (password !== confirmPassword) {
      throw new AppError('VALIDATION_ERROR', t('passwords_do_not_match'));
    }

    const supabase = await createSupabaseServerClient(); // Use direct client for OTP verification

    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash
    });

    if (verifyError || !authData?.user) {
      throw new AppError(
        'AUTH_INVALID_RESET_TOKEN',
        verifyError?.message || t('invalid_or_expired_reset_token')
      );
    }

    const { error: updateError } = await supabaseAuthProvider.updatePassword(password);

    if (updateError) {
      throw new AppError(
        'AUTH_PASSWORD_UPDATE_FAILED',
        updateError.message || t('password_update_failed')
      );
    }

    return {
      message: t('password_reset_success')
    };
  }
);

export const updatePassword = withPermission(
  'update_password',
  async (prevState: Partial<any>, formData: FormData) => {
    const t = await getTranslations('AuthResetPassword');
    const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!oldPassword || !newPassword) {
      throw new AppError('VALIDATION_ERROR', t('old_new_password_required'));
    }
    
    const { error: verifyError } = await supabaseAuthProvider.updatePassword(oldPassword);
    if (verifyError) {
      throw new AppError(
        'AUTH_PASSWORD_UPDATE_FAILED',
        verifyError.message || t('verify_old_password_failed')
      );
    }

    try {
      const { error } = await supabaseAuthProvider.updatePassword(newPassword);

      if (error) {
        throw new AppError(
          'AUTH_PASSWORD_UPDATE_FAILED',
          error.message || t('password_update_failed')
        );
      }

      return { success: true, message: t('password_updated_successfully') };
    } catch (error: any) {
      console.error("Error updating password:", error);
      throw new AppError('AUTH_PASSWORD_UPDATE_FAILED', error.message || t('password_update_generic_failed'));
    }
  }
);