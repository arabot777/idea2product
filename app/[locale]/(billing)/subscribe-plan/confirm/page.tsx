"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, RefreshCcw, Zap, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { unibeeSyncTransactionStatus } from "@/app/actions/billing/unibee-sync-transaction-status";
import { SubscriptionPlanDto } from "@/lib/types/billing/subscription-plan.dto";
import { TransactionDto, TransactionStatus } from "@/lib/types/payment/transaction.dto";
import { ReactNode } from "react";

interface StatusInfo {
  title: string;
  message: string;
  color: string;
  bgColor: string;
  icon: ReactNode;
}

export default function SubscribeConfirmPage() {
  const t = useTranslations("SubscribeConfirmPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("transactionId");

  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionDto | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(8);
  const RETRY_INTERVAL = 3000; // 3 seconds

  const getStatusInfo = useCallback(
    (status: string): StatusInfo => {
      switch (status) {
        case "completed":
          return {
            title: t("status.success.title"),
            message: t("status.success.welcome"),
            color: "text-green-400",
            bgColor: "bg-green-500",
            icon: <CheckCircle className="w-8 h-8 text-white" />,
          };
        case "failed":
          return {
            title: t("status.failed.title"),
            message: t("status.failed.message"),
            color: "text-red-400",
            bgColor: "bg-red-500",
            icon: <XCircle className="w-8 h-8 text-white" />,
          };
        case "pending":
          return {
            title: t("status.pending.title"),
            message: t("status.pending.message"),
            color: "text-blue-400",
            bgColor: "bg-blue-500",
            icon: <Clock className="w-8 h-8 text-white" />,
          };
        case "canceled":
          return {
            title: t("status.canceled.title"),
            message: t("status.canceled.message"),
            color: "text-yellow-400",
            bgColor: "bg-yellow-500",
            icon: <XCircle className="w-8 h-8 text-white" />,
          };
        case "refunded":
          return {
            title: t("status.refunded.title"),
            message: t("status.refunded.message"),
            color: "text-purple-400",
            bgColor: "bg-purple-500",
            icon: <RefreshCcw className="w-8 h-8 text-white" />,
          };
        default:
          return {
            title: t("status.pending.title"),
            message: t("status.pending.message"),
            color: "text-gray-400",
            bgColor: "bg-gray-500",
            icon: <Clock className="w-8 h-8 text-white" />,
          };
      }
    },
    [t]
  );

  const checkTransactionStatus = useCallback(async () => {
    if (!transactionId) {
      setError(t("transaction.noPlanId"));
      setIsLoading(false);
      return;
    }

    try {
      const result = await unibeeSyncTransactionStatus(transactionId || "");
      setTransaction(result.transaction || null);
      setPlan(result.plan || null);
      if (result.transaction) {
        const isFinalStatus = TransactionStatus.PENDING || transaction?.status === TransactionStatus.PROCESSING;

        if (!isFinalStatus && result.message) {
          setProgressMessage(result.message);
        } else {
          setProgressMessage(null);
        }

        if (isFinalStatus) {
          setIsLoading(false);
        }
        if (result.transaction.status === TransactionStatus.FAILED) {
          setError(result.message || t("transaction.updateFailed"));
        }

        if (result.transaction.status === TransactionStatus.COMPLETED) {
          setProgressMessage(result.message || t("transaction.syncSuccess"));
        }
        if (result.transaction.status === TransactionStatus.CANCELED) {
          setError(result.message || t("transaction.syncCanceled"));
        }
        if (result.transaction.status === TransactionStatus.REFUNDED) {
          setError(result.message || t("transaction.syncRefunded"));
        }
      } else {
        setProgressMessage(result.message);
      }
    } catch (err) {
      setProgressMessage(t("transaction.networkError"));
    }
  }, [transactionId, t]);

  useEffect(() => {
    if (!transactionId) {
      return;
    }

    const isFinalStatus = transaction?.status === TransactionStatus.PENDING || transaction?.status === TransactionStatus.PROCESSING;

    if (isFinalStatus) {
      return;
    }

    const intervalId = setInterval(() => {
      checkTransactionStatus();
    }, RETRY_INTERVAL);

    // Initial check right away
    checkTransactionStatus();

    return () => clearInterval(intervalId);
  }, [transactionId, transaction?.status, checkTransactionStatus]);

  useEffect(() => {
    if (transaction?.status === "completed") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [transaction?.status, router]);

  const handleGoHome = () => {
    router.push("/");
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
              <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>{statusInfo.icon}</div>
            ) : null}
          </div>

          <CardTitle className={`text-2xl font-bold ${error ? "text-red-400" : statusInfo ? statusInfo.color : "text-gray-200"}`}>
            {isLoading ? t("status.pending.title") : error ? t("status.failed.errorTitle") : statusInfo ? statusInfo.title : t("status.pending.title")}
          </CardTitle>

          <p className="text-gray-200">
            {isLoading ? progressMessage || t("status.pending.message") : error ? error : statusInfo ? statusInfo.message : t("status.pending.message")}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isLoading && !error && transaction && transaction.status === "completed" && (
            <>
              {plan && (
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-purple-400">{t("subscriptionDetails.title")}</h3>
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>
                      {t("subscriptionDetails.plan")}: {plan.name}
                    </p>
                    <p>
                      {t("subscriptionDetails.price")}: {transaction.amount} {transaction.currency}
                    </p>
                    <p>
                      {t("subscriptionDetails.nextBilling")}: {plan.billingCycle}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold">{t("subscriptionDetails.featuresTitle")}</h4>
                <ul className="text-sm text-gray-200 space-y-2">
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("actions.manageSubscription")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("subscriptionDetails.features.hdOutput")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("subscriptionDetails.features.priorityQueue")}
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-400 mr-2" />
                    {t("subscriptionDetails.features.noWatermark")}
                  </li>
                </ul>
              </div>
            </>
          )}

          {!isLoading && !error && transaction && transaction.status === "failed" && (
            <div className="space-y-4">
              <div className="bg-red-900/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-red-400">{t("payment.reasonsTitle")}</h3>
                <ul className="text-sm text-gray-200 space-y-1">
                  <li>• {t("payment.reasons.invalidInfo")}</li>
                  <li>• {t("payment.reasons.insufficientFunds")}</li>
                  <li>• {t("payment.reasons.networkIssue")}</li>
                  <li>• {t("payment.reasons.serviceUnavailable")}</li>
                </ul>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-400">{t("payment.solutionsTitle")}</h3>
                <ul className="text-sm text-gray-200 space-y-1">
                  <li>{t("payment.solutions.verifyInfo")}</li>
                  <li>{t("payment.solutions.checkBalance")}</li>
                  <li>{t("payment.solutions.retryLater")}</li>
                  <li>{t("payment.solutions.contactSupport")}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {transaction?.status === "completed" ? (
              <Button onClick={handleGoHome} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                {t("actions.startCreating")} ({countdown}s)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : transaction?.status === "failed" ? (
              <Button
                onClick={() => router.push("/subscribe-plan")}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                {t("actions.retryPayment")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                {error ? t("actions.backToHome") : t("actions.startCreating")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {transaction?.status === "completed" && <p className="text-xs text-gray-400">{t("status.success.confirmationEmail")}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
