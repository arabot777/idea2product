'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { updatePassword } from '@/app/actions/auth/reset-password';

export default function ProfileSecurityPage() {
  const t = useTranslations('DashboardProfileSecurityPage');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error(t('passwordMismatchDescription'));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
      
      const result = await updatePassword({}, formData);
      
      if (result && result.success) {
        toast.success(t('passwordUpdateSuccessDescription'));
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        throw new Error(result?.message || t('passwordUpdateErrorDescription'));
      }
    } catch (error: any) {
      toast.error(error.message || t('passwordUpdateErrorDescription'));
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl text-white">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="old-password" className="text-slate-300">{t('oldPasswordLabel')}</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="new-password" className="text-slate-300">{t('newPasswordLabel')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirm-new-password" className="text-slate-300">{t('confirmNewPasswordLabel')}</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <Button onClick={handleUpdatePassword} disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700">
            {loading ? t('updating') : t('updatePasswordButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}