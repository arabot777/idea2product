import React, { useEffect } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PermissionConfig } from '@/lib/db/schemas/permission/permission-config';
import type { PartialPermissionConfigDto } from '@/lib/types/permission/permission-config.dto';

// Define status types
const AUTH_STATUSES = {
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated',
} as const;

type AuthStatus = typeof AUTH_STATUSES[keyof typeof AUTH_STATUSES];

const ACTIVE_STATUSES = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ACTIVE_2FA: 'active_2fa',
} as const;

type ActiveStatus = typeof ACTIVE_STATUSES[keyof typeof ACTIVE_STATUSES];

const REJECT_ACTION = {
  HIDE: 'hide',
  DISABLE: 'disable',
  REDIRECT: 'redirect',
  THROW: 'throw',
} as const;

type RejectAction = typeof REJECT_ACTION[keyof typeof REJECT_ACTION];

type FormValues = {
  title: string;
  description?: string;
  auth_status: AuthStatus;
  active_status: ActiveStatus;
  reject_action?: RejectAction;
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Remove unused Switch import
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Remove unused Form related imports

interface PermissionEditFormProps {
  permission: PermissionConfig;
  onSave: (data: PartialPermissionConfigDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PermissionEditForm: React.FC<PermissionEditFormProps> = ({
  permission,
  onSave,
  onCancel,
  isLoading,
}) => {
  const t = useTranslations('PermissionEditForm');

  const formSchema = z.object({
    title: z.string().min(1, t('titleRequired')),
    description: z.string().optional(),
    auth_status: z.enum([
      AUTH_STATUSES.ANONYMOUS,
      AUTH_STATUSES.AUTHENTICATED,
    ]),
    active_status: z.enum([
      ACTIVE_STATUSES.INACTIVE,
      ACTIVE_STATUSES.ACTIVE,
      ACTIVE_STATUSES.ACTIVE_2FA
    ]),
    reject_action: z.string().nullable().optional(),
  });
  
  type FormData = z.infer<typeof formSchema>;

  // Define form field types
  const AUTH_OPTIONS = [
    { value: 'anonymous', label: t('anonymous') },
    { value: 'authenticated', label: t('authenticated') },
  ] as const;

  const ACTIVE_OPTIONS = [
    { value: 'inactive', label: t('inactive') },
    { value: 'active', label: t('active') },
    { value: 'active_2fa', label: t('active2FA') },
  ] as const;

  const REJECT_ACTION_OPTIONS = [
    { value: 'hide', label: t('hide') },
    { value: 'disable', label: t('disable') },
    { value: 'redirect', label: t('redirect') },
    { value: 'throw', label: t('throw') },
  ] as const;
  
  const defaultValues: FormData = {
    title: permission.title || '',
    description: permission.description || '',
    auth_status: (AUTH_OPTIONS.some(opt => opt.value === permission.auth_status)
      ? permission.auth_status
      : AUTH_STATUSES.AUTHENTICATED) as AuthStatus,
    active_status: (ACTIVE_OPTIONS.some(opt => opt.value === permission.active_status)
      ? permission.active_status
      : ACTIVE_STATUSES.ACTIVE) as ActiveStatus,
    reject_action: permission.reject_action || null,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({
      title: permission.title || '',
      description: permission.description || '',
      auth_status: permission.auth_status as AuthStatus || AUTH_STATUSES.AUTHENTICATED,
      active_status: permission.active_status as ActiveStatus || ACTIVE_STATUSES.ACTIVE,
      reject_action: permission.reject_action as RejectAction || REJECT_ACTION.REDIRECT,
    });
  }, [permission, form]);

  const onSubmit = (data: FormData) => {
    const saveData: PartialPermissionConfigDto = {
      id: permission.id,
      title: data.title,
      description: data.description || undefined,
      auth_status: data.auth_status,
      active_status: data.active_status,
    };
    
    if (data.reject_action) {
      saveData.reject_action = data.reject_action as 'hide' | 'disable' | 'redirect' | 'throw';
    }
    
    onSave(saveData);
  };

  return (
    <Dialog open={!!permission} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('editPermission')}: {permission.key}</DialogTitle>
            <DialogDescription>
              {t('editPermissionDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('key')}</Label>
              <Input value={permission.key} disabled className="bg-gray-100" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')} *</Label>
              <Input
                id="title"
                {...form.register('title')}
                disabled={isLoading}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                disabled={isLoading}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auth_status">{t('authStatus')}</Label>
              <select
                id="auth_status"
                {...form.register('auth_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {AUTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                {t('authStatusDescription')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="active_status">{t('activeStatus')}</Label>
              <select
                id="active_status"
                {...form.register('active_status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {ACTIVE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                {t('activeStatusDescription')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reject_action">{t('rejectAction')}</Label>
              <select
                id="reject_action"
                {...form.register('reject_action')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {REJECT_ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                {t('rejectActionDescription')}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
