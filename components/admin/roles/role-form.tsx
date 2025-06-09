import React, { useState, useEffect } from 'react';
import { z } from "zod"; // Import z
import { RoleDto, RoleType, RoleTypeType } from '@/lib/types/permission/role.dto';
import { useTranslations } from 'next-intl';

interface RoleFormProps {
  role?: RoleDto | null; // Pass role data if in edit mode
  onSave: (roleData: RoleDto) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onCancel }) => {
  const t = useTranslations('RoleForm');
  const [name, setName] = useState(role?.name || '');
  const [roleType, setRoleType] = useState<RoleTypeType>(role?.role_type || RoleType.USER);
  const [description, setDescription] = useState(role?.description || '');

  useEffect(() => {
    if (role) {
      setName(role.name);
      setRoleType(role.role_type);
      setDescription(role.description || '');
    } else {
      setName('');
      setRoleType('user');
      setDescription('');
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      // Edit mode
      const updatedRole: RoleDto = {
        id: role.id,
        name,
        role_type: roleType,
        description,
      };
      onSave(updatedRole);
    } else {
      // Create mode
      const newRole: RoleDto = {
        id: '', // New roles need an ID, assuming it's generated on the backend or can be a placeholder
        name,
        role_type: roleType,
        description,
      };
      onSave(newRole);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">{t('roleName')}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="roleType" className="block text-sm font-medium text-gray-700 mb-2">{t('roleType')}</label>
        <select
          id="roleType"
          value={roleType}
          onChange={(e) => setRoleType(e.target.value as RoleTypeType)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(RoleType).map((type) => (
            <option key={type} value={type}>
              {type === RoleType.USER && t('userRole')}
              {type === RoleType.TEAM_USER && t('teamUserRole')}
              {type === RoleType.TEAM_ADMIN && t('teamAdminRole')}
              {type === RoleType.SYSTEM_ADMIN && t('systemAdminRole')}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {role ? t('update') : t('create')}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;