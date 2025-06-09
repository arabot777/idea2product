"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { PageHeader } from "@/components/admin/page-header";
import { UserTable } from "@/components/admin/users/user-table";
import { listUserProfile } from "@/app/actions/auth/list-user-profile";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";

export default function UsersPage() {
  const t = useTranslations('AdminUsersPage');
  const [users, setUsers] = useState<ProfileDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await listUserProfile();
      setUsers(data || []);
    } catch (error) {
      console.error("failedToLoadUsers", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, []);

  // Handle user updated
  const handleUserUpdated = () => {
    loadUsers();
  };

  return (
    <div>
      <PageHeader 
        title={t("userManagement.title")} 
        description={t("userManagement.description")} 
      />
      <UserTable 
        users={users} 
        onUserUpdated={handleUserUpdated}
        isLoading={isLoading}
      />
    </div>
  );
}