import React from 'react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import NavigationMenu from '@/components/admin/navigation-menu';
import Header from '@/components/admin/header';
import Breadcrumbs from '@/components/admin/breadcrumbs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('AdminLayout');
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left navigation bar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">{t('navigation')}</h2>
        <NavigationMenu />
      </aside>

      {/* Right main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation bar */}
        <Header userName={t('adminUserName')} /> {/* Assuming username is Admin, should be fetched from session in reality */}

        {/* Main content area */}
        <main className="flex-1 p-4">
          <Breadcrumbs />
          <div className="mt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}