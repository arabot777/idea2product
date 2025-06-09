'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/admin/page-header';
import { PremiumPackageForm } from '@/components/admin/premium-packages/premium-package-form'; // Will create this component
import { getPremiumPackage } from '@/app/actions/billing/get-premium-package'; // Assuming this action exists
import { AppError } from '@/lib/types/app.error';

interface PremiumPackageDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PremiumPackageDetailPage({
  params,
}: PremiumPackageDetailPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  let premiumPackage = null;
  let error = null;
  const t = useTranslations('AdminPremiumPackageDetailPage');

  if (id !== 'new') {
    try {
      premiumPackage = await getPremiumPackage(id);
    } catch (err) {
      if (err instanceof AppError && err.code === 'NOT_FOUND') {
        notFound();
      }
      error = err as Error;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={id === 'new' ? t('createNewPremiumPackage') : t('editPremiumPackage')}
        description={id === 'new' ? t('createNewPremiumPackageDescription') : t('editPremiumPackageDescription')}
      />

      {error && (
        <div className="mb-4 text-red-500">
          {t('loadPremiumPackageFailed')}: {error.message || t('unknownError')}
        </div>
      )}

      <Suspense fallback={<div>{t('loadingForm')}</div>}>
        <PremiumPackageForm initialData={premiumPackage} />
      </Suspense>
    </div>
  );
}