'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { getUsageStats } from '@/app/actions/billing/get-usage-stats';
import { AppError } from '@/lib/types/app.error';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface UsageStatsData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  // More statistics can be added, e.g.:
  // totalRevenue: number;
  // newSubscriptionsLastMonth: number;
}

export function UsageStats() {
  const [stats, setStats] = useState<UsageStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('UsageStats');

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    setLoading(true);
    try {
      // const response = await getUsageStats();
      setStats({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
      });
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : t('errorLoadingUsageStats');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('usageStatsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('usageStatsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('cannotLoadUsageStats')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('usageStatsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
          <p className="text-sm text-gray-500">{t('totalSubscriptions')}</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
          <p className="text-sm text-gray-500">{t('activeSubscriptions')}</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{stats.trialSubscriptions}</p>
          <p className="text-sm text-gray-500">{t('trialSubscriptions')}</p>
        </div>
      </CardContent>
    </Card>
  );
}