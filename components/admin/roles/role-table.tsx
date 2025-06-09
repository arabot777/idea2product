import React from 'react';
import { RoleDto } from '@/lib/types/permission/role.dto';
import { useTranslations } from 'next-intl';

interface RoleTableProps {
  roles: RoleDto[];
  onManagePermissions: (role: RoleDto) => void;
  onDeleteRole: (roleName: string) => void;
  onEditRole: (role: RoleDto) => void; // New edit event
}

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  onManagePermissions,
  onDeleteRole,
  onEditRole,
}) => {
  const t = useTranslations('RoleTable');
  const getRoleTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      user: t('userRole'),
      team_user: t('teamUserRole'),
      team_admin: t('teamAdminRole'),
      system_admin: t('systemAdminRole'),
    };
    return typeLabels[type] || type;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roleName')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('roleType')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoleTypeLabel(role.role_type)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.description || t('noDescription')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onManagePermissions(role)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  {t('managePermissions')}
                </button>
                <button
                  onClick={() => onEditRole(role)} // Edit button
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDeleteRole(role.name)}
                  className="text-red-600 hover:text-red-900"
                >
                  {t('delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {roles.length === 0 && (
        <div className="text-center py-8 text-gray-500">{t('noRoles')}</div>
      )}
    </div>
  );
};

export default RoleTable;