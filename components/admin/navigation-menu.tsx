import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface NavigationMenuProps {
  // Additional properties can be added as needed, e.g., current active path
}

const NavigationMenu: React.FC<NavigationMenuProps> = () => {
  const t = useTranslations('NavigationMenu'); // Assuming navigation menu translations are also in AdminLayout

  const navItems = [
    { name: t('dashboard'), href: '/admin/dashboard' },
    { name: t('users'), href: '/admin/users' },
    { name: t('roles'), href: '/admin/roles' },
    { name: t('permissions'), href: '/admin/permissions' },
    { name: t('subscription-plan'), href: '/admin/subscription-plan' },
    { name: t('billable-metrics'), href: '/admin/billable-metrics' },
    { name: t('settings'), href: '/admin/settings' },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-200">
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavigationMenu;