"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { getUserTransactions } from '@/app/actions/billing/get-user-transactions';
import { listSubscriptionPlans } from '@/app/actions/billing/list-subscription-plans';
import { listPremiumPackages } from '@/app/actions/billing/list-premium-packages';
import { TransactionDto } from '@/lib/types/payment/transaction.dto';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { PremiumPackageDto } from '@/lib/types/billing/premium-package.dto';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ProfileTransactionsPage() {
  const t = useTranslations('ProfileTransactions');

  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDto[]>([]);
  const [premiumPackages, setPremiumPackages] = useState<PremiumPackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          transactionsResult,
          subscriptionPlansData,
          premiumPackagesData
        ] = await Promise.all([
          getUserTransactions({ page: 1, pageSize: 100 }),
          listSubscriptionPlans(),
          listPremiumPackages()
        ]);

        setTransactions(transactionsResult.data || []);
        setSubscriptionPlans(subscriptionPlansData || []);
        setPremiumPackages(premiumPackagesData || []);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function: Find the corresponding subscription plan or premium package name based on productId in the transaction
  const getItemName = (productId: string) => {
    const subscription = subscriptionPlans.find(plan => plan.id === productId);
    if (subscription) {
      return subscription.name;
    }
    const premiumPackage = premiumPackages.find(pkg => pkg.id === productId);
    if (premiumPackage) {
      return premiumPackage.name;
    }
    return t('unknownItem');
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{t('error')}: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Transaction History Table */}
        {transactions.length > 0 ? (
          <Table>
            <TableCaption>{t('transactionHistoryCaption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] text-slate-300">{t('transactionId')}</TableHead>
                <TableHead className="text-slate-300">{t('itemName')}</TableHead>
                <TableHead className="text-slate-300">{t('amount')}</TableHead>
                <TableHead className="text-slate-300">{t('type')}</TableHead>
                <TableHead className="text-slate-300">{t('status')}</TableHead>
                <TableHead className="text-right text-slate-300">{t('transactionDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{getItemName(transaction.associatedId)}</TableCell>
                  <TableCell>{t('amountSymbol')}{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{t(transaction.type)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {t(transaction.status.toLowerCase())}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-slate-400">{t('noTransactions')}</p>
        )}
      </CardContent>
    </Card>
  );
}