import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSubscriptionPlan } from '@/app/actions/billing/get-subscription-plan';
import { SubscriptionPlanForm } from '@/components/subscription/subscription-plan-form';
import { AppError } from '@/lib/types/app.error';
import { useTranslations } from 'next-intl';

interface SubscriptionPlanDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function SubscriptionPlanDetailPage({
  params, // params is now a Promise
}: SubscriptionPlanDetailPageProps) {
  const resolvedParams = await params; // Await it
  const { id } = resolvedParams; // Use resolvedParams
  let plan = null;
  let error = null;
  const t = useTranslations('AdminSubscriptionPlanDetailPage');

  if (id !== 'new') {
    try {
      plan = await getSubscriptionPlan(id);
    } catch (err) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        notFound();
      }
      error = err as Error; // Explicitly type as Error
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {id === 'new' ? t('createNewSubscriptionPlan') : t('editSubscriptionPlan')}
      </h1>

      {error && (
        <div className="mb-4 text-red-500">
          {t('loadSubscriptionPlanFailed')}: {error.message || t('unknownError')}
        </div>
      )}

      <Suspense fallback={<div>{t('loadingForm')}</div>}>
        <SubscriptionPlanForm initialData={plan} />
      </Suspense>
    </div>
  );
}