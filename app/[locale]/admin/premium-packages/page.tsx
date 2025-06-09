'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/admin/page-header';
import { PremiumPackageTable } from '@/components/admin/premium-packages/premium-package-table'; // Will create this component

export default function PremiumPackagesPage() {
  const t = useTranslations('AdminPremiumPackagesPage'); // Assuming a new i18n namespace

  return (
    <div className="container mx-auto py-8">
      <PageHeader title={t('title')} description={t('description')} />

      <div className="flex justify-end mb-4">
        <Link href="/admin/premium-packages/new">
          <Button>{t('createNewPremiumPackage')}</Button>
        </Link>
      </div>

      <Suspense fallback={<div>{t('loadingPremiumPackages')}</div>}>
        <PremiumPackageTable />
      </Suspense>
    </div>
  );
}