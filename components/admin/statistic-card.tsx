import React from 'react';

interface StatisticCardProps {
  title: string;
  value: number | string;
  description?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <h3 className="text-lg font-semibold text-gray-500 mb-2">{title}</h3>
      <p className="text-4xl font-bold text-indigo-600 mb-2">{value}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};

export default StatisticCard;