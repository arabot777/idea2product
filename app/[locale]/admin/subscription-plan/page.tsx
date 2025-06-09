import { Suspense } from 'react';
import Link from 'next/link';
import { SubscriptionPlanList } from '@/components/subscription/subscription-plan-list';
import { UsageStats } from '@/components/subscription/usage-stats';
import { useTranslations } from 'next-intl';
import { CreateSubscriptionPlanDialog } from '@/components/subscription/create-subscription-plan-dialog';

export default function SubscriptionAdminPage() {
  const t = useTranslations('SubscriptionAdminPage');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      <div className="mb-8">
        <Suspense fallback={<div>{t('loadingUsageStats')}</div>}>
          <UsageStats />
        </Suspense>
      </div>

      <div className="flex justify-end mb-4">
        <CreateSubscriptionPlanDialog />
      </div>

      <Suspense fallback={<div>{t('loadingSubscriptionPlanList')}</div>}>
        <SubscriptionPlanList />
      </Suspense>
    </div>
  );
}