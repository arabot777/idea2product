'use client';

import React, { useState, useEffect } from 'react';
import { PermissionConfigDto } from '@/lib/types/permission/permission-config.dto';
import { PermissionTable } from '@/components/admin/permission/permission-table';
import { PermissionEditForm } from '@/components/admin/permission/permission-edit-form';
import { PermissionSyncDialog } from '@/components/admin/permission/permission-sync-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PermissionDiff } from '@/lib/types/permission/permission-config.bean';
import { useTranslations } from 'next-intl';
import { getPagePermissionConfigs } from '@/app/actions/permission/get-page-permission-configs';
import { updatePermission } from '@/app/actions/permission/update-permission';
import { syncPermissionsToDatabase } from '@/app/actions/permission/sync-permissions-to-database';
import { getPermissionDiffs } from '@/app/actions/permission/get-permission-diffs';

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionConfigDto[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [editingPermission, setEditingPermission] = useState<PermissionConfigDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncDiffs, setSyncDiffs] = useState<PermissionDiff[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('PermissionsPage');

  const fetchPermissions = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      const data = await getPagePermissionConfigs({
        page,
        pageSize: size
      });
      setPermissions(data.data);
      setTotal(data.total || data.data.length);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToLoadPermissions'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleEdit = (permission: PermissionConfigDto) => {
    setEditingPermission(permission);
  };

  const handleSave = async (updatedData: Partial<PermissionConfigDto>) => {
    if (!editingPermission || !updatedData.id) return;

    setIsSaving(true);
    try {
      await updatePermission(updatedData.id, updatedData);

      toast({
        title: t('success'),
        description: t('permissionUpdatedSuccessfully'),
      });
      setEditingPermission(null);
      fetchPermissions(); // Refresh the list
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToUpdatePermission'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPermission(null);
  };

  const handlePageChange = (page: number) => {
    fetchPermissions(page);
  };

  const handleSyncPermissions = async () => {
    setIsSyncing(true);
    try {
      await syncPermissionsToDatabase(syncDiffs);

      toast({
        title: t('success'),
        description: t('permissionsSyncedSuccessfully'),
      });
      setIsSyncDialogOpen(false);
      fetchPermissions(); // Refresh the list
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToSyncPermissions'),
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenSyncDialog = async () => {
    setLoading(true); // Show loading state while fetching diffs
    try {
      const data = await getPermissionDiffs();
      setSyncDiffs(data);
      setIsSyncDialogOpen(true);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToLoadPermissionDiffs'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{t('permissionManagementTitle')}</CardTitle>
          <Button onClick={handleOpenSyncDialog} disabled={loading || isSyncing}>
            {t('syncSystemPermissions')}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('loadingPermissions')}</div>
          ) : (
            <PermissionTable 
              permissions={permissions} 
              total={total}
              currentPage={currentPage}
              pageSize={pageSize}
              onEdit={handleEdit}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {editingPermission && (
        <Card>
          {/* <CardHeader>
            <CardTitle>{t('editPermission')}: {editingPermission.key}</CardTitle>
          </CardHeader> */}
          <CardContent>
            <PermissionEditForm
              permission={editingPermission}
              onSave={handleSave}
              onCancel={handleCancelEdit}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      )}

      <PermissionSyncDialog
        isOpen={isSyncDialogOpen}
        onClose={() => setIsSyncDialogOpen(false)}
        onConfirm={handleSyncPermissions}
        diffs={syncDiffs}
        isLoading={isSyncing}
      />
    </div>
  );
};

export default PermissionsPage;