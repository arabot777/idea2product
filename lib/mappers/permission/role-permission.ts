import { RolePermissionDto } from "../../types/permission/role-permission.dto";
import { RolePermission } from "../../db/schemas/permission/role-permission";

export const RolePermissionMapper = {
  toDTO: (model: RolePermission): RolePermissionDto => {
    return {
      roleId: model.roleId,
      permissionId: model.permissionId,
    };
  },

  fromDTO: (dto: RolePermissionDto): RolePermission => {
    return {
      roleId: dto.roleId,
      permissionId: dto.permissionId,
    };
  },

  toDTOList: (models: RolePermission[]): RolePermissionDto[] => {
    return models.map(RolePermissionMapper.toDTO);
  },

  fromDTOList: (dtos: RolePermissionDto[]): Partial<RolePermission>[] => {
    return dtos.map(RolePermissionMapper.fromDTO);
  },
};
