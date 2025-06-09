import { PermissionConfigDto } from "../../types/permission/permission-config.dto";
import { AuthStatusType, ActiveStatusType, RejectActionType, PermissionScopeType } from "../../types/permission/permission-config.dto";
import { PermissionConfig, NewPermissionConfig } from "../../db/schemas/permission/permission-config";

export const PermissionConfigMapper = {
  toDTO: (model: PermissionConfig): PermissionConfigDto => {
    return {
      id: model.id,
      key: model.key,
      target: model.target,
      scope: model.scope as PermissionScopeType,
      auth_status: model.auth_status as AuthStatusType,
      active_status: model.active_status as ActiveStatusType,
      subscription_types: model.subscription_types,
      reject_action: model.reject_action as RejectActionType,
      title: model.title,
      description: model.description,
    };
  },

  fromDTO: (dto: PermissionConfigDto): Partial<NewPermissionConfig> => {
    return {
      key: dto.key,
      target: dto.target,
      scope: dto.scope,
      auth_status: dto.auth_status,
      active_status: dto.active_status,
      subscription_types: dto.subscription_types,
      reject_action: dto.reject_action,
      title: dto.title,
      description: dto.description,
    };
  },
  toDTOList: (models: PermissionConfig[]): PermissionConfigDto[] => {
    return models.map(PermissionConfigMapper.toDTO);
  },

  fromDTOList: (dtos: PermissionConfigDto[]): Partial<PermissionConfig>[] => {
    return dtos.map(PermissionConfigMapper.fromDTO);
  },
};
