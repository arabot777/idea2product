'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { updateTransactionStatus } from "@/app/actions/billing/update-transaction-status";
import { TransactionStatus } from "@/lib/db/schemas/payment/transaction";

export default function SubscribeCancelPage() {
  const t = useTranslations('SubscribeCancelPage');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      updateTransactionStatus(sessionId, 'failed' as TransactionStatus).then(result => {
        if (result.success) {
          console.log('Transaction status updated to failed successfully.');
        } else {
          console.error('Failed to update transaction status:', result.message);
        }
      });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">{t("title")}</CardTitle>
          <p className="text-gray-300">{t("message")}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-red-400">{t("possibleReasons.title")}</h3>
            <ul className="text-sm text-gray-300 space-y-1 text-left">
              <li>• {t("possibleReasons.paymentInfoError")}</li>
              <li>• {t("possibleReasons.insufficientFunds")}</li>
              <li>• {t("possibleReasons.networkIssue")}</li>
              <li>• {t("possibleReasons.paymentServiceUnavailable")}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">{t("suggestedSolutions.title")}</h4>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li>{t("suggestedSolutions.checkPaymentInfo")}</li>
              <li>{t("suggestedSolutions.checkBalance")}</li>
              <li>{t("suggestedSolutions.retryLater")}</li>
              <li>{t("suggestedSolutions.contactSupport")}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Link href="/subscribe">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("actions.retrySubscription")}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("actions.backToHomepage")}
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">{t("needHelp")}</p>
            <Button variant="link" className="text-purple-400 hover:text-purple-300">
              {t("contactCustomerSupport")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}