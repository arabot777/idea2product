import { RoleDto, RoleTypeType } from "../../types/permission/role.dto";
import { Role } from "../../db/schemas/permission/role";

export const RoleMapper = {
  toDTO: (model: Role): RoleDto => {
    return {
      id: model.id,
      name: model.name,
      role_type: model.role_type as RoleTypeType,
      description: model.description,
    };
  },

  fromDTO: (dto: RoleDto): Partial<Role> => {
    return {
      name: dto.name,
      role_type: dto.role_type,
      description: dto.description,
    };
  },

  toDTOList: (models: Role[]): RoleDto[] => {
    return models.map(RoleMapper.toDTO);
  },

  fromDTOList: (dtos: RoleDto[]): Partial<Role>[] => {
    return dtos.map(RoleMapper.fromDTO);
  },
};
