'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CircleIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ConfirmPage() {
  const t = useTranslations('AuthConfirmPage');
  const searchParams = useSearchParams();
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    success?: string;
  }>({
    loading: true
  });

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!token_hash || type !== 'email') {
      setState({
        loading: false,
        error: t('invalidVerificationLink')
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const supabase = createClient();
        
        const { error } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash
        });

        if (error) {
          setState({
            loading: false,
            error: error.message || t('failedToVerifyEmail')
          });
          return;
        }

        setState({
          loading: false,
          success: t('emailVerifiedSuccessfully')
        });
      } catch (error) {
        setState({
          loading: false,
          error: t('unexpectedErrorOccurred')
        });
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('verifyingYourEmail')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          {state.loading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-2">{t('verifyingYourEmailEllipsis')}</span>
            </div>
          ) : state.error ? (
            <>
              <div className="text-red-500 mb-4">{state.error}</div>
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                {t('backToLoginPage')}
              </Link>
            </>
          ) : (
            <>
              <div className="text-green-500 mb-4">{state.success}</div>
              <Link
                href="/login"
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                {t('goToLoginPage')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}