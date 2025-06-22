"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth/sign-out';
import { redirect } from 'next/navigation';

export default function ProfileSettingsPage() {
  const t = useTranslations('DashboardProfileSettingsPage');

  const handleSignOut = async () => {
    await signOut();
    redirect('/login');
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
      <CardHeader>
        <CardTitle className="text-xl">{t('settings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Placeholder settings items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('notificationSettings')}</h3>
          <p className="text-slate-300">{t('manageNotificationPreferences')}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('languagePreference')}</h3>
          <p className="text-slate-300">{t('chooseYourPreferredLanguage')}</p>
        </div>

        {/* Sign out button */}
        <div className="pt-4 border-t border-slate-700">
          <Button onClick={handleSignOut} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {t('signOut')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}