'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Mail, ArrowLeft, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { sendPasswordResetOtp } from '@/app/actions/auth/send-password-reset-otp';
import { resetPasswordWithOtp } from '@/app/actions/auth/reset-password-with-otp';
import { ActionState } from '@/lib/types/api.bean';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type ForgotPasswordState = ActionState & { email?: string; stage: 'send_otp' | 'reset_password' };

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const router = useRouter();
  const t = useTranslations('AuthForgotPasswordPage');

  const [state, formAction, pending] = useActionState<ForgotPasswordState, FormData>(
    async (previousState: ForgotPasswordState, formData: FormData) => {
      const email = formData.get('email') as string;
      const currentStage = previousState.stage;

      try {
        if (currentStage === 'send_otp') {
          const result = await sendPasswordResetOtp(previousState, formData);
          if (result.success) {
            return { ...result, stage: 'reset_password', email: email || previousState.email };
          }
          return { ...result, stage: 'send_otp', email: email || previousState.email };
        } else {
          // currentStage === 'reset_password'
          const actionType = formData.get('actionType');
          if (actionType === 'resend_otp') {
            const result = await sendPasswordResetOtp(previousState, formData);
            if (result.success) {
              return { ...result, stage: 'reset_password', email: email || previousState.email };
            }
            return { ...result, stage: 'reset_password', email: email || previousState.email };
          } else {
            const result = await resetPasswordWithOtp(previousState, formData);
            if (result.success) {
              return { ...result, stage: 'reset_password', email: email || previousState.email };
            }
            return { ...result, stage: 'reset_password', email: email || previousState.email };
          }
        }
      } catch (error: any) {
        return {
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message || t('common.anErrorOccurred')
          },
          email: email || previousState.email,
          stage: currentStage
        };
      }
    },
    { error: undefined, email: initialEmail, stage: 'send_otp' }
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      if (state.stage === 'reset_password' && state.success === t('common.passwordResetSuccess')) {
        router.push('/login');
      }
    }
    if (state?.error) {
      toast.error(state.error.message);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center pb-8 relative">
            <Link
              href="/login"
              className="absolute top-4 left-4 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('returnToSignIn')}
            </Link>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">{t('forgotPasswordTitle')}</CardTitle>
            <p className="text-slate-400">
              {state.stage === 'send_otp' ? t('forgotPasswordDescription') : t('resetPasswordDescription')}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              className="space-y-4"
              action={formAction}
              suppressHydrationWarning
            >
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
                  {t('emailLabel')}
                </Label>
                {state.stage === 'reset_password' && (
                  <Button
                    type="submit"
                    name="actionType"
                    value="resend_otp"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 p-0 h-auto"
                    disabled={pending}
                  >
                    {pending && state.stage === 'send_otp' ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {t('sendingOtp')}
                      </>
                    ) : (
                      t('resendOtp')
                    )}
                  </Button>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state?.email || initialEmail}
                  required
                  maxLength={50}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  placeholder={t('emailPlaceholder')}
                  readOnly={state.stage === 'reset_password'} // Make email read-only in reset stage
                />
              </div>

              {state.stage === 'reset_password' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-slate-200 font-medium">
                      {t('otpLabel')}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="token"
                        name="token"
                        type="text"
                        required
                        maxLength={6} // Assuming 6-digit OTP
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                        placeholder={t('otpPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-medium">
                      {t('newPasswordLabel')}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                        placeholder={t('newPasswordPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                      {t('confirmNewPasswordLabel')}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                        placeholder={t('confirmNewPasswordPlaceholder')}
                      />
                    </div>
                  </div>
                </>
              )}


              {state?.error && (
                <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg border border-red-800">
                  <span className="font-medium">{t('errorPrefix')}</span> {state.error.message || t('common.anErrorOccurred')}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {state.stage === 'send_otp' ? t('sendingOtp') : t('resettingPassword')}
                  </>
                ) : (
                  <>
                    {state.stage === 'send_otp' ? t('sendOtpButton') : t('resetPasswordButton')}
                    {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}