
"use client";

import React from 'react';
import QuickAccessCard from '@/components/admin/quick-access-card';
import { FaUserCog, FaShieldAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

const DashboardPage = () => {
  const t = useTranslations('AdminDashboardPage');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      
      {/* Quick Access */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('quickAccess')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickAccessCard
            title={t('roleManagement')}
            description={t('roleManagementDescription')}
            href="/admin/roles"
            icon={<FaUserCog />}
          />
          <QuickAccessCard
            title={t('permissionManagement')}
            description={t('permissionManagementDescription')}
            href="/admin/permissions"
            icon={<FaShieldAlt />}
          />
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;