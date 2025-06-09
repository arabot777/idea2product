'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { SubscriptionPlanDto, SubscriptionPlanDtoSchema } from '@/lib/types/billing/subscription-plan.dto';
import { createSubscriptionPlan } from '@/app/actions/billing/create-subscription-plan';
import { updateSubscriptionPlan } from '@/app/actions/billing/update-subscription-plan';
import { AppError } from '@/lib/types/app.error';
import { useTranslations } from 'next-intl';

const formSchema = SubscriptionPlanDtoSchema.omit({ id: true }).extend({
  // Additional form validation rules can be added here if needed
  // For example, ensure price is positive
  price: z.number().positive('pricePositiveError'),
});

// Exclude 'id' field from SubscriptionPlanDto and ensure 'isActive' is required
type SubscriptionPlanFormValues = Omit<z.infer<typeof SubscriptionPlanDtoSchema>, 'id'> & {
  // Ensure isActive is required
  isActive: boolean;
  // Add other optional fields
  interval?: 'month' | 'year' | 'week' | 'day';
  isPublic?: boolean;
  isTrial?: boolean;
  trialDays?: number;
  sortOrder?: number;
};

interface SubscriptionPlanFormProps {
  initialData?: SubscriptionPlanDto | null;
  onSuccess?: () => void;
}

export function SubscriptionPlanForm({ initialData, onSuccess }: SubscriptionPlanFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!initialData;
  const t = useTranslations('SubscriptionPlanForm');

  const defaultValues: SubscriptionPlanFormValues = {
    name: '',
    description: '',
    price: 0,
    currency: 'usd',
    billingCycle: 'monthly',
    isActive: true,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Optional fields
    interval: 'month',
  };

  const form = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: initialData ? {
      ...defaultValues,
      ...initialData,
      trialDays: (initialData as any).trialDays || 0,
      isActive: initialData.isActive ?? true,
      metadata: initialData.metadata || null,
      // Ensure correct date types
      createdAt: initialData.createdAt ? new Date(initialData.createdAt) : new Date(),
      updatedAt: new Date(),
    } : defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (values: SubscriptionPlanFormValues) => {
    try {
      if (isEditMode && initialData) {
        await updateSubscriptionPlan({
          id: initialData.id,
          ...values
        });
        toast({
          title: t('success'),
          description: t('updateSuccess'),
        });
      } else {
        await createSubscriptionPlan(values as any); // Temporary as any, check type later
        toast({
          title: t('success'),
          description: t('subscriptionPlanCreated'),
        });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/subscription-plan');
      }
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : isEditMode
          ? t('updateFailed')
          : t('createFailed');
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('price')}</FormLabel>
              <FormControl>
                <Input type="number" placeholder={t('pricePlaceholder')} {...field} onChange={event => field.onChange(parseFloat(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('currency')}</FormLabel>
              <FormControl>
                <Input placeholder={t('currencyPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('billingInterval')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="month" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('month')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="year" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('year')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('public')}</FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        {/* Features and Limits fields can be more complex,
            for simplicity, they are omitted or handled as JSON string inputs */}
        <Button type="submit">{isEditMode ? t('updateButton') : t('createButton')}</Button>
      </form>
    </FormProvider>
  );
}