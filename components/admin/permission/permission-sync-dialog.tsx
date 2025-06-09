import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PermissionDiff } from '@/lib/types/permission/permission-config.bean';
import { useTranslations } from 'next-intl';

interface PermissionSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diffs: PermissionDiff[];
  isLoading: boolean;
}

export const PermissionSyncDialog: React.FC<PermissionSyncDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  diffs,
  isLoading,
}) => {
  const newPermissions = diffs.filter((d) => d.status === 'new');
  const updatedPermissions = diffs.filter((d) => d.status === 'updated');
  const deletedPermissions = diffs.filter((d) => d.status === 'deleted');
  const t = useTranslations('PermissionSyncDialog');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmSyncTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmSyncDescription')}
            <div className="mt-4 space-y-2 text-sm">
              {newPermissions.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t('newPermissions')} ({newPermissions.length})：</h4>
                  <ul className="list-disc list-inside">
                    {newPermissions.map((d) => (
                      <li key={d.key}>{d.key}</li>
                    ))}
                  </ul>
                </div>
              )}
              {updatedPermissions.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t('updatedPermissions')} ({updatedPermissions.length})：</h4>
                  <ul className="list-disc list-inside">
                    {updatedPermissions.map((d) => (
                      <li key={d.key}>{d.key}</li>
                    ))}
                  </ul>
                </div>
              )}
              {deletedPermissions.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t('deletedPermissions')} ({deletedPermissions.length})：</h4>
                  <ul className="list-disc list-inside">
                    {deletedPermissions.map((d) => (
                      <li key={d.key}>{d.key}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diffs.length === 0 && <p>{t('noChangesDetected')}</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} disabled={isLoading || diffs.length === 0}>
              {isLoading ? t('syncing') : t('confirmSync')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};