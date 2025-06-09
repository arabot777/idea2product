"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getUserTransactions } from '@/app/actions/billing/get-user-transactions';
import { listSubscriptionPlans } from '@/app/actions/billing/list-subscription-plans';
import { listPremiumPackages } from '@/app/actions/billing/list-premium-packages';
import { TransactionDto } from '@/lib/types/payment/transaction.dto';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { PremiumPackageDto } from '@/lib/types/billing/premium-package.dto';
import { format } from 'date-fns';

export default function ProfilePlansPage() {
  const t = useTranslations('DashboardProfilePlansPage');

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

  // Find the current active subscription plan
  const activeSubscription = transactions.find(
    (tx) => tx.type === 'subscription' && tx.status === 'completed' && tx.currentPeriodEnd && new Date(tx.currentPeriodEnd) > new Date()
  );
  const activeSubscriptionPlan = activeSubscription ? subscriptionPlans.find(plan => plan.id === activeSubscription.associatedId) : null;

  // Find purchased premium packages
  const purchasedPremiumPackages = transactions
    .filter((tx) => tx.type === 'premium_package' && tx.status === 'completed')
    .map((tx) => premiumPackages.find((pkg) => pkg.id === tx.associatedId))
    .filter(Boolean) as PremiumPackageDto[];

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myPlansTitle')}</CardTitle>
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
          <CardTitle className="text-xl text-white">{t('myPlansTitle')}</CardTitle>
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
        <CardTitle className="text-xl text-white">{t('myPlansTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Active Subscription Area */}
        <h3 className="text-lg font-semibold mb-4">{t('activeSubscriptionTitle')}</h3>
        {activeSubscriptionPlan ? (
          <div className="mb-6 p-4 border border-slate-600 rounded-md">
            <p className="text-lg font-medium">{activeSubscriptionPlan.name}</p>
            <p className="text-slate-400">{activeSubscriptionPlan.description}</p>
            <p className="text-slate-400">
              {t('expires')}: {activeSubscription?.currentPeriodEnd ? format(new Date(activeSubscription.currentPeriodEnd), 'yyyy-MM-dd') : t('unknown')}
            </p>
          </div>
        ) : (
          <p className="text-slate-400 mb-6">{t('noActiveSubscription')}</p>
        )}

        {/* Purchased Premium Packages Area */}
        <h3 className="text-lg font-semibold mb-4">{t('purchasedPremiumPackagesTitle')}</h3>
        {purchasedPremiumPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {purchasedPremiumPackages.map((pkg) => (
              <div key={pkg.id} className="p-4 border border-slate-600 rounded-md">
                <p className="text-lg font-medium">{pkg.name}</p>
                <p className="text-slate-400">{pkg.description}</p>
                {/* Premium Package Validity */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 mb-6">{t('noPurchasedPremiumPackages')}</p>
        )}
      </CardContent>
    </Card>
  );
}