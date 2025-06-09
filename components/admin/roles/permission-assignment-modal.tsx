import React, { useState, useEffect } from 'react';
import { RoleDto } from '@/lib/types/permission/role.dto';
import type { PermissionConfig } from '@/lib/db/schemas/permission/permission-config';
import { useTranslations } from 'next-intl';

interface PermissionAssignmentModalProps {
  show: boolean;
  onClose: () => void;
  role: RoleDto;
  allPermissions: PermissionConfig[];
  rolePermissions: PermissionConfig[];
  onSave: (roleId: string, selectedPermissionIds: string[]) => void;
}

const PermissionAssignmentModal: React.FC<PermissionAssignmentModalProps> = ({
  show,
  onClose,
  role,
  allPermissions,
  rolePermissions,
  onSave,
}) => {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const t = useTranslations('PermissionAssignmentModal');

  useEffect(() => {
    if (show && rolePermissions) {
      setSelectedPermissionIds(rolePermissions.map(p => p.id));
    }
  }, [show, rolePermissions]);

  const handleCheckboxChange = (permissionId: string, isChecked: boolean) => {
    setSelectedPermissionIds((prev) =>
      isChecked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)
    );
  };

  const handleSave = () => {
    onSave(role.id, selectedPermissionIds);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('manageRolePermissions', { roleName: role.name })}
          </h3>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {allPermissions.map((permission) => (
                <label key={permission.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    value={permission.id}
                    checked={selectedPermissionIds.includes(permission.id)}
                    onChange={(e) => handleCheckboxChange(permission.id, e.target.checked)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{permission.key}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                  <div className="text-xs text-gray-400">{permission.scope}</div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionAssignmentModal;