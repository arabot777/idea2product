import React from 'react';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const t = useTranslations('Header'); // Assuming header translations are also in AdminLayout
  const displayUserName = userName || t('defaultUserName');

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">{t('adminPanelTitle')}</h1>
      <div className="flex items-center space-x-4">
        <span>{t('welcome')}, {displayUserName}</span>
        {/* User avatar, logout button, etc. can be added here */}
      </div>
    </header>
  );
};

export default Header;