"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('ProfilePage');
  const pathname = usePathname();

  const getActiveLinkClass = (path: string) => {
    return `block text-slate-300 hover:text-blue-400 transition-colors duration-200 ${pathname.startsWith(path) ? 'font-bold text-blue-400' : ''}`;
  };

  // If the current path is /profile, redirect to /profile/info
  if (pathname.endsWith('/profile')) {
    redirect('/profile/info');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 mt-16">
        {/* Left sidebar menu */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white">{t('navigation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <Link href="/profile/info" className={getActiveLinkClass('/profile/info')}>
                  {t('personalInfo')}
                </Link>
                <Link href="/profile/security" className={getActiveLinkClass('/profile/security')}>
                  {t('accountSecurity')}
                </Link>
                <Link href="/profile/plans" className={getActiveLinkClass('/profile/plans')}>
                  {t('myPlans')}
                </Link>
                <Link href="/profile/transactions" className={getActiveLinkClass('/profile/transactions')}>
                  {t('myTransactions')}
                </Link>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main content area */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {children}
        </main>
      </div>
    </div>
  );
}