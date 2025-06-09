'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubscriptionPlanForm } from './subscription-plan-form';
import { useTranslations } from 'next-intl';

export function CreateSubscriptionPlanDialog() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('CreateSubscriptionPlanDialog');

  const handleSuccess = () => {
    setOpen(false);
    // The page will automatically refresh as SubscriptionPlanList will refetch data
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('createNewSubscriptionPlan')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createNewSubscriptionPlan')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SubscriptionPlanForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
