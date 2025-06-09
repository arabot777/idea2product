'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionState } from '@/lib/types/api.bean';
import { getTranslations } from 'next-intl/server';

export async function sendResetPasswordEmail(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string;
  const t = await getTranslations('AuthSendResetPasswordEmail');

  if (!email) {
    return {
      error: {
        code: 'MISSING_EMAIL',
        message: t('emailRequired')
      }
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/confirm?message=${t('passwordResetLinkSent')}`
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
    success: t('passwordResetEmailSuccess')
  };
}