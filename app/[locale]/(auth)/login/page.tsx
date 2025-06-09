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
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { signIn } from '@/app/actions/auth/sign-in';
import { createClient } from '@/lib/supabase/client';
import { ActionState } from '@/lib/types/api.bean';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getCurrentUserProfile } from '@/app/actions/auth/get-user-info';

export default function LoginPage() {
  const router = useRouter();
  const { data: userInfo, isLoading:isUserLoading, mutate } = useSWR('current-user', getCurrentUserProfile);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const t = useTranslations('AuthLoginPage');

  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Redirect to homepage if user is already logged in
  useEffect(() => {
    if (!isUserLoading && userInfo && userInfo.id) {
      toast.success(t('userLoggedIn'));
      router.push('/');
    }
  }, [userInfo, isUserLoading, router, t]);

  const [state, formAction, pending] = useActionState<ActionState & { email?: string; password?: string; name?: string; agreeToTerms?: boolean }, FormData>(
    async (previousState: ActionState, formData: FormData) => {
      console.log('formDataEntries', Array.from(formData.entries())); // Log form data entries
      try {
        if (!agreeToTerms) {
          return {
            error: {
              code: 'TERMS_NOT_ACCEPTED',
              message: t('pleaseAgreeToTerms')
            },
            email: formData.get('email') as string || '',
            password: formData.get('password') as string || '',
            agreeToTerms: false
          };
        }

        const formDataCopy = new FormData();
        formData.forEach((value, key) => {
          if (typeof value === 'string' || value instanceof File) {
            formDataCopy.append(key, value);
          }
        });
        const result = await signIn(formDataCopy);
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
          agreeToTerms: agreeToTerms
        };
      }
    },
    { error: undefined, agreeToTerms: false }
  );



  // Redirection logic after successful login/registration
  useEffect(() => {
    if (state?.success) {
      const redirectUrl = redirect || '/';
      router.push(redirectUrl);
    }
    if (state?.agreeToTerms !== undefined) {
      setAgreeToTerms(state.agreeToTerms);
    }
  }, [state?.agreeToTerms, redirect, router]);

  // Show loading state if user information is being loaded
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <CardTitle className="text-2xl font-bold text-white mb-2">{t('welcomeBack')}</CardTitle>
            <p className="text-slate-400">{t('signInToAccount')}</p>
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
                    defaultValue={state?.email || ''}
                    required
                    maxLength={50}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200 font-medium">
                    {t('passwordLabel')}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    defaultValue={state?.password || ''}
                    required
                    minLength={8}
                    maxLength={100}
                    className="pl-10 pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                    placeholder={t('passwordPlaceholder')}
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

              {state?.error && (
                <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg border border-red-800">
                  <span className="font-medium">{t('errorPrefix')}</span> {state.error.message || t('anErrorOccurredDuringRegistration')}
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
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    {t('signInButton')}
                    {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">{t('or')}</span>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                {t('newUserPrompt')}{' '}
                <Link
                  href={`/register${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  {t('createAccountButton')}
                </Link>
              </p>
            </div>

            {/* OAuth Login Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <form
                  action={async () => {
                    const redirectTo = `${window.location.origin}/auto-login?type=social-google`;
                    const client = createClient();
                    const { error } = await client.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo },
                    });
                  }}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500"
                    disabled={pending}
                  >
                    <span className="sr-only">{t('signInWithGoogle')}</span>
                    {t('google')}
                  </Button>
                </form>
              </div>

              <div>
                <form
                  action={async () => {
                    const redirectTo = `${window.location.origin}/auto-login?type=social-github`;
                    const client = createClient();
                    const { error } = await client.auth.signInWithOAuth({
                      provider: "github",
                      options: { redirectTo },
                    });
                  }}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500"
                    disabled={pending}
                  >
                    <span className="sr-only">{t('signInWithGitHub')}</span>
                    {t('github')}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}