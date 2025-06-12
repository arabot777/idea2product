"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getUserSubscriptionPlan} from '@/app/actions/billing/get-user-subscription-plan';
import { listActiveSubscriptionPlans } from '@/app/actions/billing/list-active-subscription-plans';
import { UserSubscriptionPlanDto } from '@/lib/types/billing/user-subscription-plan.dto';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function ProfilePlansPage() {
  const t = useTranslations('DashboardProfilePlansPage');

  const [userPlan, setUserPlan] = useState<UserSubscriptionPlanDto | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          userSubscriptionPlanData,
          allSubscriptionPlansData,
        ] = await Promise.all([
          getUserSubscriptionPlan(),
          listActiveSubscriptionPlans(),
        ]);

        setUserPlan(userSubscriptionPlanData);
        setSubscriptionPlans(allSubscriptionPlansData || []);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeSubscriptionPlan = userPlan ? subscriptionPlans.find(plan => plan.id === userPlan.sourceId) : null;

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
        {userPlan && activeSubscriptionPlan ? (
          <div className="relative w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl rounded-lg p-6">
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 shadow-lg">{t("currentPlan")}</Badge>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">{userPlan.name}</h2>
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-4xl font-bold text-white">
                {activeSubscriptionPlan.currency === "cny" ? "¥" : "$"}
                {activeSubscriptionPlan.price}
              </span>
              <span className="text-slate-400 ml-1">/{t(`${activeSubscriptionPlan.billingCycle}`)}</span>
            </div>
            <p className="text-slate-400 text-center mb-6">{userPlan.description}</p>

            <ul className="space-y-4 mb-6">
              {activeSubscriptionPlan.metadata?.features && Object.values(activeSubscriptionPlan.metadata.features).map((feature: any, index: number) => (
                <li key={index} className="flex items-center">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-slate-300 flex-1">{String(feature)}</span>
                </li>
              ))}
            </ul>

            <p className="text-slate-400 text-center mb-6">
              {t('expires')}: {userPlan?.currentPeriodEnd ? format(new Date(userPlan.currentPeriodEnd), 'yyyy-MM-dd') : t('unknown')}
            </p>

            <Button className="w-full h-12 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25">
              {t('manageSubscription')}
            </Button>
          </div>
        ) : (
          <p className="text-slate-400 mb-6">{t('noActiveSubscription')}</p>
        )}
      </CardContent>
    </Card>
  );
}