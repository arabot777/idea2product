'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { register as signUp } from '@/app/actions/auth/register-user';
import { ActionState } from '@/lib/types/api.bean';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getCurrentUserProfile } from '@/app/actions/auth/get-user-info';

export default function SignUpPage() {
  const router = useRouter();
  const { data: userInfo, isLoading: isUserLoading, mutate } = useSWR('current-user', getCurrentUserProfile);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const t = useTranslations('AuthRegisterPage');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (!isUserLoading && userInfo && userInfo.id) {
      toast.success(t('userLoggedIn')); // Assuming 'userLoggedIn' is a valid key
      router.push('/');
    }
  }, [userInfo, isUserLoading, router, t]);

  const [state, formAction, pending] = useActionState<ActionState & { email?: string; password?: string; name?: string; confirmPassword?: string; agreeToTerms?: boolean }, FormData>(
    async (previousState: ActionState, formData: FormData) => {
      try {
        if (!agreeToTerms) {
          return {
            error: {
              code: 'TERMS_NOT_ACCEPTED',
              message: t('pleaseAgreeToTerms')
            },
            email: formData.get('email') as string || '',
            password: formData.get('password') as string || '',
            name: formData.get('name') as string || '',
            confirmPassword: formData.get('confirmPassword') as string || '',
            agreeToTerms: false
          };
        }

        const formDataCopy = new FormData();
        formData.forEach((value, key) => {
          if (typeof value === 'string' || value instanceof File) {
            formDataCopy.append(key, value);
          }
        });
        const result = await signUp(formDataCopy);
        await mutate();
        return result;
      } catch (error: any) {
        return {
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message || t('anErrorOccurred')
          },
          email: formData.get('email') as string || '',
          password: formData.get('password') as string || '',
          name: formData.get('name') as string || '',
          confirmPassword: formData.get('confirmPassword') as string || '',
          agreeToTerms: agreeToTerms
        };
      }
    },
    { error: undefined, agreeToTerms: false }
  );

  useEffect(() => {
    if (state?.agreeToTerms !== undefined) {
      setAgreeToTerms(state.agreeToTerms);
    }
  }, [state?.agreeToTerms]);

  useEffect(() => {
    if (state?.success) {
      const redirectUrl = redirect || '/';
      router.push(redirectUrl);
    }
  }, [state, redirect, router]);


  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center pb-8 relative">
            <Link
              href="/"
              className="absolute top-4 left-4 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('goHome')}
            </Link>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">{t('title')}</CardTitle>
            <p className="text-slate-400">{t('subtitle')}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              className="space-y-4"
              action={formAction}
              suppressHydrationWarning
            >
              <input type="hidden" name="redirect" value={redirect || ''} />
              <input type="hidden" name="priceId" value={priceId || ''} />
              <input type="hidden" name="inviteId" value={inviteId || ''} />

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200 font-medium">
                  {t('nameLabel')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={t('namePlaceholder')}
                    defaultValue={state?.name || ''}
                    required
                    maxLength={50}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
                  {t('emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('emailPlaceholder')}
                    defaultValue={state?.email || ''}
                    required
                    maxLength={50}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium">
                  {t('passwordLabel')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('passwordPlaceholder')}
                    defaultValue={state?.password || ''}
                    required
                    minLength={8}
                    maxLength={100}
                    className="pl-10 pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                  {t('confirmPasswordLabel')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    defaultValue={state?.confirmPassword || ''}
                    required
                    minLength={8}
                    maxLength={100}
                    className="pl-10 pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {state?.error && (
                <div className="text-red-500 text-sm mt-2">
                  {state.error.message}
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  name="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setAgreeToTerms(checked);
                    }
                  }}
                  className="mt-1 border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                  {t('agreeToTerms')}{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    {t('termsOfService')}
                  </Link>{' '}
                  {t('and')}{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    {t('privacyPolicy')}
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
                disabled={pending} // Use pending from useActionState
              >
                {pending ? t('signingUp') : t('signUpButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                {t('existingUserPrompt')}{' '}
                <Link
                  href={`/login${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  {t('signInExistingAccountButton')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}