'use client';

import { useState, useEffect, useCallback } from 'react';

interface Permissions {
  [key: string]: boolean;
}

interface UsePermissionsResult {
  can: (permission: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        let fetchedPermissions: Permissions = {};

const response = await fetch('/api/permissions');
if (!response.ok) {
  throw new Error(`Error fetching permissions: ${response.statusText}`);
}
const data = await response.json();
fetchedPermissions = data.permissions || {};
        setPermissions(fetchedPermissions);
      } catch (err: any) {
        setError(err.message);
        console.error('Failed to fetch permissions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const can = useCallback((permission: string) => {
    return permissions[permission] === true;
  }, [permissions]);

  return { can, isLoading, error };
}