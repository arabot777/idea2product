import React from 'react';
import { useTranslations } from 'next-intl';

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string; // Assuming ISO string for simplicity
  userName?: string;
}

interface ActivityListProps {
  logs: ActivityLog[];
}

const ActivityList: React.FC<ActivityListProps> = ({ logs }) => {
  const t = useTranslations('ActivityList');
  return (
    <div className="flow-root">
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {logs.length === 0 ? (
          <li className="py-4 text-center text-gray-500">{t('noActivityLogs')}</li>
        ) : (
          logs.map((log) => (
            <li key={log.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {log.userName ? `${log.userName} ${log.action}` : log.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ActivityList;