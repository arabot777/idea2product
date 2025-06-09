"use client";

import { useEffect, useState } from 'react';
import { ProfileDTO } from '@/lib/types/auth/profile.dto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUserProfile } from '@/app/actions/auth/get-user-info';
import { updateAccount } from '@/app/actions/auth/update-profile';
import { uploadFile } from '@/app/actions/common/upload';
import { useToast } from '@/components/ui/use-toast';
import useSWR from "swr";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileInfoPage() {
  const t = useTranslations('ProfileInfo');
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  const { data: userInfo, error, isLoading, mutate } = useSWR('current-user', getCurrentUserProfile);

  useEffect(() => {
    if (userInfo) {
      setProfile(userInfo);
      setOriginalProfile(userInfo);
    }
  }, [userInfo]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      await updateAccount({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });
      await mutate(); // Revalidate data after successful update
      setIsEditing(false);
      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: t('updateErrorTitle'),
        description: err.message || t('updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => (prevProfile ? {
      ...prevProfile,
      [name]: value,
    } : null));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
 
    // Preview image
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        setAvatarData(event.target!.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: t('uploadErrorTitle'),
        description: t('fileSizeExceedsLimit'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const resizedFile = await new Promise<File>((resolve) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Clean up the object URL
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 366;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file); // Fallback to original file if blob creation fails
            }
          }, file.type);
        };
      });

      const formData = new FormData();
      formData.append("file", resizedFile);

      const result = await uploadFile(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data?.publicUrl) {
        setAvatarData(null);
        setProfile((prevProfile) => (prevProfile ? {
          ...prevProfile,
          avatar_url: result.data.publicUrl,
        } : null));
        toast({
          title: t('uploadSuccessTitle'),
          description: t('uploadSuccessDescription'),
          variant: 'default',
        });
      }
    } catch (err: any) {
      toast({
        title: t('uploadErrorTitle'),
        description: err.message || t('uploadErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{t('error')}: {error.message || t('fetchErrorDescription')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">{t('noProfileFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl text-white">{t('title')}</CardTitle>
        {isEditing ? (
          <div className="space-x-2">
            <Button onClick={handleSaveClick} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? t('saving') : t('saveButton')}
            </Button>
            <Button variant="outline" onClick={handleCancelClick} className="bg-white border-slate-600 text-gray-500 hover:bg-white/80 hover:text-gray-700 ">
              {t('cancelButton')}
            </Button>
          </div>
        ) : (
          <Button onClick={handleEditClick} className="bg-blue-600 hover:bg-blue-700">
            {t('editButton')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-start gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Use a responsive grid for overall layout */}
          {/* Avatar Section with upload overlay */}
          <div className="flex flex-col items-center justify-center col-span-full md:col-span-1 lg:col-span-1 mb-4 relative group">
            <div className="relative">
              <label htmlFor="avatarUpload" className="cursor-pointer">
                <Avatar className="h-48 w-48 border-2 border-slate-600 group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarData || profile.avatar_url || ""} alt={profile.full_name || t('userAvatarAlt')} />
                  <AvatarFallback className="bg-slate-700 text-white text-6xl">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-70 transition-opacity">
                    <div className="bg-white p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                )}
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {isEditing && (
              <p className="text-xs text-slate-400 mt-2">
                {t('clickToUpload')}
              </p>
            )}
          </div>

          {/* Editable Fields Section - when editing, show inputs; otherwise, show text */}
          <div className="col-span-full md:col-span-1 lg:col-span-2 grid grid-cols-1 gap-4"> {/* This div will hold editable fields */}
            {/* Full Name */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="fullName" className="text-slate-300">{t('fullNameLabel')}</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  type="text"
                  name="full_name"
                  value={profile.full_name || ''}
                  onChange={handleChange}
                  placeholder={t('fullNamePlaceholder')}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              ) : (
                <p className={`${profile.full_name ? 'text-slate-300' : 'text-gray-500'} text-lg font-semibold`}>{profile.full_name || t('unsetValue')}</p>
              )}
            </div>
          </div>

          {/* Non-Editable Fields Section - always display as text, in a grid */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6 pt-6 border-t border-slate-700"> {/* Separator for clarity */}
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-slate-300">{t('emailLabel')}</Label>
              <p className="text-slate-300 text-lg">{profile.email}</p>
            </div>

            {/* Username */}
            <div className="flex flex-col space-y-1.5">
              <Label className="text-slate-300">{t('usernameLabel')}</Label>
              <p className={`${profile.username ? 'text-slate-300' : 'text-gray-500'} text-lg`}>{profile.username || t('unsetValue')}</p>
            </div>

            {/* Roles */}
            <div className="flex flex-col space-y-1.5">
              <Label className="block text-sm font-medium text-slate-300">{t('rolesLabel')}</Label>
              <p className={`${profile.roles && profile.roles.length > 0 ? 'text-slate-300' : 'text-gray-500'} text-lg`}>{profile.roles.join(', ') || t('unsetValue')}</p>
            </div>

            {/* Created Time */}
            <div className="flex flex-col space-y-1.5">
              <Label className="block text-sm font-medium text-slate-300">{t('createdAtLabel')}</Label>
              <p className="text-slate-300 text-lg">{profile.createdAt.toLocaleDateString()}</p>
            </div>

            {/* Updated Time */}
            <div className="flex flex-col space-y-1.5">
              <Label className="block text-sm font-medium text-slate-300">{t('updatedAtLabel')}</Label>
              <p className="text-slate-300 text-lg">{profile.updatedAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}