"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { autoLogin } from "@/app/actions/auth/auto-login";
import { Loader2, Zap, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";
import { getCurrentUserProfile } from '@/app/actions/auth/get-user-info';

export default function AutoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("AutoLoginPage");
  const { data: user, isLoading: isUserLoading, mutate } = useSWR("current-user", getCurrentUserProfile);

  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [countdown, setCountdown] = useState(3); // Countdown 3 seconds

  useEffect(() => {
    if (isUserLoading) return;

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const timeWait = type === "social-google" ? 2000 : 4000;

    const performAutoLogin = async () => {
      const loginData: any = {
        type,
      };

      if (type === "social-google" || type === "social-github") {
        loginData.code = params.get("code");
        if (!loginData.code) {
          const hash = window.location.hash;
          const hashWithoutHash = hash.substring(1);
          const ext_params = new URLSearchParams(hashWithoutHash);
          loginData.access_token = ext_params.get("access_token");
          loginData.refresh_token = ext_params.get("refresh_token");
          if (!loginData.access_token || !loginData.refresh_token) {
            setError(t("invalidParams"));
            setIsPending(false);
            return;
          }
        }
      } else {
        loginData.token_hash = params.get("token_hash");
        if (!loginData.token_hash) {
          setError(t("invalidParams"));
          setIsPending(false);
          return;
        }
      }

      setIsPending(true);
      setError(undefined);
      try {
        const result = await autoLogin({}, loginData);
        if (result.success && result.profile) {
          mutate();
          // Login successful, start countdown
          let count = 3;
          setCountdown(count);
          const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(timer);
              router.push("/");
            }
          }, 1000);
        } else {
          setError(result.error?.message || t("autoLoginFailed"));
          setIsPending(false);
        }
      } catch (err: any) {
        setError(err.error?.message || t("anErrorOccurred"));
        setIsPending(false);
      }
    };

    const timer = setTimeout(performAutoLogin, timeWait);

    return () => clearTimeout(timer);
  }, [isUserLoading, user, router, searchParams, t]);

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
            <Link href="/" className="absolute top-4 left-4 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("goHome")}
            </Link>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">{t("autoLoginTitle")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center min-h-[160px]">
              {isPending && !error && (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500 mb-2" />
                  <div className="text-lg text-slate-300">{t("loggingIn")}</div>
                </>
              )}
              {!isPending && !error && countdown > 0 && (
                <>
                  <Zap className="w-12 h-12 text-green-500 mb-4" />
                  <div className="text-xl font-semibold text-white mb-2">{t("autoLoginSuccess", { count: countdown })}</div>
                </>
              )}
              {!isPending && error && (
                <>
                  <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg border border-red-800 text-center">
                    <span className="font-medium">{t("errorPrefix")}</span> {error}
                  </div>
                  <button
                    className="mt-4 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    onClick={() => {
                      router.push("/");
                    }}>
                    {t("goHome")}
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
