'use client';
 
import { useState, useEffect } from 'react';
import { getRoles } from '@/app/actions/permission/get-roles';
import { createRole } from '@/app/actions/permission/create-role';
import { updateRole } from '@/app/actions/permission/update-role';
import { deleteRole } from '@/app/actions/permission/delete-role';
import { getAllPermissionConfigs } from '@/app/actions/permission/get-all-permission-configs';
import { getRolePermissions } from '@/app/actions/permission/get-role-permissions';
import { rebindPermissionsToRole } from '@/app/actions/permission/rebind-permissions-to-role';
import { RoleDto } from '@/lib/types/permission/role.dto';
import { PermissionConfigDto } from '@/lib/types/permission/permission-config.dto';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
 
// Import components
import RoleTable from '@/components/admin/roles/role-table';
import RoleForm from '@/components/admin/roles/role-form';
import PermissionAssignmentModal from '@/components/admin/roles/permission-assignment-modal';

export default function RolesManagePage() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionConfigDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionConfigDto[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // New edit form state
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null); // New editing role data
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        getRoles(),
        getAllPermissionConfigs()
      ]);
      setRoles(rolesData.map(role => ({
        id: role.id,
        name: role.name,
        role_type: role.role_type as RoleDto['role_type'], // Explicit type conversion
        description: role.description,
      })));
      setPermissions(permissionsData.data.map((perm) => ({
        ...perm,
        scope: perm.scope as PermissionConfigDto['scope'], // Explicit type conversion
        auth_status: perm.auth_status as PermissionConfigDto['auth_status'],
        active_status: perm.active_status as PermissionConfigDto['active_status'],
        reject_action: perm.reject_action as PermissionConfigDto['reject_action'],
      })));
    } catch (error) {
      console.error('loadDataFailed', error);
      // TODO: Display user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateRole = async (roleData: RoleDto) => {
    try {
      if ('id' in roleData && roleData.id) {
        // Update role
        await updateRole({ id: roleData.id }, roleData);
        toast.success(t('roleUpdateSuccess'));
      } else {
        // Create role
        // Ensure that the type passed to createRole is CreateRoleDto
        // When creating a role, id is optional because it is database generated
        const createData: Partial<RoleDto> = {
          name: roleData.name!,
          description: roleData.description,
          role_type: roleData.role_type || 'user',
        };
        await createRole(createData as RoleDto); // createRole might require a complete RoleDto
        toast.success(t('roleCreateSuccess'));
      }
      setShowCreateForm(false);
      setShowEditForm(false);
      setEditingRole(null);
      loadData();
    } catch (error) {
      console.error('saveRoleFailed', error);
      toast.error(t('saveRoleFailed'));
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    try {
      await deleteRole({ name: roleName });
      loadData();
      toast.success(t('roleDeleteSuccess'));
    } catch (error) {
      console.error('deleteRoleFailed', error);
      toast.error(t('deleteRoleFailed'));
    }
  };

  const handleEditRole = (role: RoleDto) => {
    setEditingRole(role);
    setShowEditForm(true);
  };

  const handleManagePermissions = async (role: RoleDto) => {
    try {
      const perms = await getRolePermissions(role.name);
      setSelectedRole(role);
      setRolePermissions(perms);
      setShowPermissionModal(true);
    } catch (error) {
      console.error('loadRolePermissionsFailed', error);
      toast.error(t('loadRolePermissionsFailed'));
    }
  };

  const handleSavePermissions = async (roleId: string, selectedPermissionIds: string[]) => {
    try {
      // assignPermissionsToRole receives roleName, not roleId
      const roleToUpdate = roles.find(r => r.id === roleId);
      if (!roleToUpdate) {
        throw new Error(t('roleNotFound'));
      }
      await rebindPermissionsToRole({
        roleId: roleToUpdate.id,
        permissionIds: selectedPermissionIds,
      });
      setShowPermissionModal(false);
      toast.success(t('permissionAssignmentSuccess'));
    } catch (error) {
      console.error('assignPermissionsFailed', error);
      toast.error(t('assignPermissionsFailed'));
    }
  };

  const t = useTranslations('AdminRolesPage');
  if (loading) {
    return <div className="p-6">{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t('roleManagementTitle')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('roleManagementDescription')}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {t('createRoleButton')}
          </button>
        </div>

        <div className="px-6 py-4">
          <RoleTable
            roles={roles}
            onManagePermissions={handleManagePermissions}
            onDeleteRole={handleDeleteRole}
            onEditRole={handleEditRole}
          />
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRole ? t('editRole') : t('createNewRole')}
              </h3>
              <RoleForm
                role={editingRole}
                onSave={handleCreateOrUpdateRole}
                onCancel={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setEditingRole(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedRole && (
        <PermissionAssignmentModal
          show={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          role={selectedRole}
          allPermissions={permissions}
          rolePermissions={rolePermissions}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
}