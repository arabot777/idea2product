"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/transactions');
  }, [router]);

  return null; // Or a loading indicator can be displayed
}