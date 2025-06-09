import React from 'react';
import Link from 'next/link';

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode; // Optional icon
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ title, description, href, icon }) => {
  return (
    <Link href={href} className="block">
      <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
        {icon && <div className="text-indigo-600 text-3xl">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default QuickAccessCard;