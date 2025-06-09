'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { listSubscriptionPlans } from '@/app/actions/billing/list-subscription-plans';
import { updateSubscriptionPlan } from '@/app/actions/billing/update-subscription-plan';
import { AppError } from '@/lib/types/app.error';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

export function SubscriptionPlanList() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('SubscriptionPlanList');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await listSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : t('errorLoadingPlans');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await updateSubscriptionPlan({
        id,
        isActive: false,
      });
      toast({
        title: t('success'),
        description: t('deleteSuccess'),
      });
      fetchPlans(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : t('errorDeletingPlan');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('price')}</TableHead>
            <TableHead>{t('interval')}</TableHead>
            <TableHead>{t('public')}</TableHead>
            <TableHead>{t('trial')}</TableHead>
            <TableHead>{t('sortOrder')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                {t('noPlans')}
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  {plan.price} {plan.currency.toUpperCase()}
                </TableCell>
                <TableCell>{plan.billingCycle}</TableCell>
                <TableCell>{plan.isActive ? t('yes') : t('no')}</TableCell>
                <TableCell>{plan.metadata?.isTrial ? t('yes') : t('no')}</TableCell>
                <TableCell>{plan.metadata?.sortOrder || t('notApplicable')}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/subscription/${plan.id}`}>
                    <Button variant="outline" size="sm" className="mr-2">
                      {t('edit')}
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisable(plan.id)}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}