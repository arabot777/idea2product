// app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const t = useTranslations('AuthLayout');
  // Add debug information to help confirm route loading status
  useEffect(() => {
    console.log('authLayoutLoaded', pathname);
  }, [pathname]);
  
  return (
    <div className="auth-layout">
      {/* Authentication layout specific UI elements can be added here */}
      {children}
    </div>
  );
}