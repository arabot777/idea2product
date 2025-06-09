
"use client";

import React, { useState, useEffect } from 'react';
import StatisticCard from '@/components/admin/statistic-card';
import QuickAccessCard from '@/components/admin/quick-access-card';
import ActivityList from '@/components/admin/activity-list';
import { FaUsers, FaKey, FaHistory, FaUserCog, FaShieldAlt } from 'react-icons/fa';
import { ApiResponse, ApiListResponse, ApiError } from '@/lib/types/api.bean';
import { useTranslations } from 'next-intl';

// Define the type for Dashboard statistics (consistent with app/api/dashboard/route.ts)
interface DashboardStats {
  totalRoles: number;
  totalPermissions: number;
}

// Define the type for activity logs (consistent with app/api/dashboard/route.ts)
interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const t = useTranslations('AdminDashboardPage');

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch Stats
      try {
        const statsResponse = await fetch('/api/dashboard?type=stats');
        const statsData: ApiResponse<DashboardStats> = await statsResponse.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        } else {
          setStatsError(statsData.error?.message || t('failedToFetchStats'));
        }
      } catch (error: any) {
        setStatsError(error.message || t('unexpectedErrorFetchingStats'));
      } finally {
        setLoadingStats(false);
      }

      // Fetch Activities
      try {
        const activitiesResponse = await fetch('/api/dashboard?type=activities');
        const activitiesData: ApiListResponse<ActivityLog> = await activitiesResponse.json();
        if (activitiesData.success && activitiesData.data) {
          setActivities(activitiesData.data);
        } else {
          setActivitiesError(activitiesData.error?.message || t('failedToFetchActivities'));
        }
      } catch (error: any) {
        setActivitiesError(error.message || t('unexpectedErrorFetchingActivities'));
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      {/* System Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('systemOverview')}</h2>
        {loadingStats ? (
          <p>{t('loadingStats')}</p>
        ) : statsError ? (
          <p className="text-red-500">{t('error')}: {statsError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatisticCard
              title={t('totalRoles')}
              value={stats?.totalRoles ?? 0}
              description={t('totalRolesDescription')}
            />
            <StatisticCard
              title={t('totalPermissions')}
              value={stats?.totalPermissions ?? 0}
              description={t('totalPermissionsDescription')}
            />
            {/* Add more statistic cards as needed */}
          </div>
        )}
      </section>

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

      {/* Recent Activities */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t('recentActivities')}</h2>
        {loadingActivities ? (
          <p>{t('loadingActivities')}</p>
        ) : activitiesError ? (
          <p className="text-red-500">{t('error')}: {activitiesError}</p>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <ActivityList logs={activities} />
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;