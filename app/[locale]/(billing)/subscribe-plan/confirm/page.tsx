'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, RefreshCcw, Zap, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { updateTransactionStatus } from "@/app/actions/billing/update-transaction-status";
import { TransactionStatus } from "@/lib/db/schemas/payment/transaction";
import { SubscriptionPlanDto } from "@/lib/types/billing/subscription-plan.dto";
import { TransactionDto } from "@/lib/types/payment/transaction.dto";
import { ReactNode } from "react";

interface StatusInfo {
  title: string;
  message: string;
  color: string;
  bgColor: string;
  icon: ReactNode;
}

export default function SubscribeConfirmPage() {
  const t = useTranslations("subscribe");
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionDto | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(8);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_INTERVAL = 3000; // 3 seconds

  const getStatusInfo = useCallback((status: string): StatusInfo => {
    switch (status) {
      case 'completed':
        return {
          title: t("success.title"),
          message: t("success.welcome"),
          color: 'text-green-400',
          bgColor: 'bg-green-500',
          icon: <CheckCircle className="w-8 h-8 text-white" />
        };
      case 'failed':
        return {
          title: t("failed.title"),
          message: t("failed.message"),
          color: 'text-red-400',
          bgColor: 'bg-red-500',
          icon: <XCircle className="w-8 h-8 text-white" />
        };
      case 'pending':
        return {
          title: "Subscription in Progress",
          message: t("success.syncingStatus"),
          color: 'text-blue-400',
          bgColor: 'bg-blue-500',
          icon: <Clock className="w-8 h-8 text-white" />
        };
      case 'canceled':
        return {
          title: "Subscription Canceled",
          message: t("failed.possibleReasons.paymentInfoError"),
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500',
          icon: <XCircle className="w-8 h-8 text-white" />
        };
      case 'refunded':
        return {
          title: "Subscription Refunded",
          message: "Your transaction has been refunded",
          color: 'text-purple-400',
          bgColor: 'bg-purple-500',
          icon: <RefreshCcw className="w-8 h-8 text-white" />
        };
      default:
        return {
          title: t("success.loading"),
          message: t("success.syncingStatus"),
          color: 'text-gray-400',
          bgColor: 'bg-gray-500',
          icon: <Clock className="w-8 h-8 text-white" />
        };
    }
  }, [t]);

  const checkTransactionStatus = useCallback(async () => {
    if (!sessionId) {
      setError(t("success.errors.noSessionId"));
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateTransactionStatus(sessionId, 'pending');
      if (result.success && result.transaction) {
        // Type conversion to ensure type safety
        const typedTransaction = {
          ...result.transaction,
          metadata: result.transaction.metadata as Record<string, any> | null
        } as TransactionDto;
        setTransaction(typedTransaction);

        if (result.plan) {
          const typedPlan = {
            ...result.plan,
            currency: result.plan.currency as "usd" | "cny",
            billingCycle: result.plan.billingCycle as "monthly" | "annual",
            metadata: result.plan.metadata as Record<string, any> | null
          } as SubscriptionPlanDto;
          setPlan(typedPlan);
        }
        console.log(`Transaction status checked: ${result.transaction.status}`);
      } else {
        setError(result.message || t("success.errors.updateFailed"));
        console.error('Failed to check transaction status:', result.message);
      }
    } catch (err) {
      setError(t("success.errors.networkError"));
      console.error('Network error or unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, t]);

  useEffect(() => {
    if (!sessionId) {
      setError(t("success.errors.noSessionId"));
      setIsLoading(false);
      return;
    }

    checkTransactionStatus();
  }, [sessionId, t, checkTransactionStatus]);

  useEffect(() => {
    if (!isLoading && !error) {
      // If transaction status is pending, continue polling
      if (transaction?.status === 'pending' && retryCount < MAX_RETRIES) {
        const timer = setTimeout(() => {
          setIsLoading(true);
          setRetryCount(prev => prev + 1);
          void checkTransactionStatus();
        }, RETRY_INTERVAL);
        return () => clearTimeout(timer);
      }
      
      // If transaction is completed or max retries reached, start countdown
      if (transaction?.status === 'completed' || retryCount >= MAX_RETRIES) {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [isLoading, error, router, transaction?.status, retryCount, checkTransactionStatus]);

  const handleGoHome = () => {
    router.push('/');
  };

  const statusInfo = transaction ? getStatusInfo(transaction.status) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isLoading ? (
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center animate-spin">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
            ) : error ? (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            ) : statusInfo ? (
              <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
                {statusInfo.icon}
              </div>
            ) : null}
          </div>
          
          <CardTitle className={`text-2xl font-bold ${
            error ? 'text-red-400' : 
            statusInfo ? statusInfo.color :
            'text-gray-200'
          }`}>
            {isLoading ? t("success.loading") : 
             error ? t("success.errors.title") :
             statusInfo ? statusInfo.title :
             t("success.loading")}
          </CardTitle>
          
          <p className="text-gray-200">
            {isLoading ? t("success.syncingStatus") : 
             error ? error :
             statusInfo ? statusInfo.message :
             t("success.syncingStatus")}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isLoading && !error && transaction && plan && transaction.status === 'completed' && (
            <>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-purple-400">{t("success.details.title")}</h3>
                <div className="text-sm text-gray-200 space-y-1">
                  <p>{t("success.details.plan")}: {plan.name}</p>
                  <p>{t("success.details.price")}: {transaction.amount} {transaction.currency}</p>
                  <p>{t("success.details.nextBilling")}: {plan.billingCycle}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">{t("success.features.title")}</h4>
                <ul className="text-sm text-gray-200 space-y-2">
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("success.features.dailyGenerations")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("success.features.hdOutput")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("success.features.priorityQueue")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("success.features.noWatermark")}
                  </li>
                </ul>
              </div>
            </>
          )}

          {!isLoading && !error && transaction && transaction.status === 'failed' && (
            <div className="space-y-4">
              <div className="bg-red-900/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-red-400">{t("failed.possibleReasons.title")}</h3>
                <ul className="text-sm text-gray-200 space-y-1">
                  <li>• {t("failed.possibleReasons.paymentInfoError")}</li>
                  <li>• {t("failed.possibleReasons.insufficientFunds")}</li>
                  <li>• {t("failed.possibleReasons.networkIssue")}</li>
                  <li>• {t("failed.possibleReasons.paymentServiceUnavailable")}</li>
                </ul>
              </div>
              
              <div className="bg-blue-900/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-400">{t("failed.suggestedSolutions.title")}</h3>
                <ul className="text-sm text-gray-200 space-y-1">
                  <li>{t("failed.suggestedSolutions.checkPaymentInfo")}</li>
                  <li>{t("failed.suggestedSolutions.checkBalance")}</li>
                  <li>{t("failed.suggestedSolutions.retryLater")}</li>
                  <li>{t("failed.suggestedSolutions.contactSupport")}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {transaction?.status === 'completed' ? (
              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                {t("success.actions.startCreating")} ({countdown}s)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : transaction?.status === 'failed' ? (
              <Button
                onClick={() => router.push('/subscribe-plan')}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {t("failed.actions.retrySubscription")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                {error ? t("failed.actions.backToHomepage") : t("success.actions.startCreating")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            <Button variant="outline" asChild className="w-full">
              <Link href="/profile">{t("success.actions.manageSubscription")}</Link>
            </Button>
          </div>

          {transaction?.status === 'completed' && (
            <p className="text-xs text-gray-400">{t("success.emailConfirmation")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}