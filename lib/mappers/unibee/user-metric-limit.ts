import { UserMetricLimitDto } from "../../types/unibee/user-metric-limit-dto";
import { UserMetricLimit } from "../../db/schemas/unibee/user-metric-limit";

export const UserMetricLimitMapper = {
  toDTO: (model: UserMetricLimit): UserMetricLimitDto => {
    return {
      id: model.id,
      userId: model.userId,
      code: model.code,
      metricName: model.metricName,
      totalLimit: model.totalLimit,
      currentUsedValue: model.currentUsedValue,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: UserMetricLimitDto): Partial<UserMetricLimit> => {
    return {
      userId: dto.userId,
      code: dto.code,
      metricName: dto.metricName,
      totalLimit: dto.totalLimit,
      currentUsedValue: dto.currentUsedValue,
    };
  },

  toDTOList: (models: UserMetricLimit[]): UserMetricLimitDto[] => {
    return models.map(UserMetricLimitMapper.toDTO);
  },

  fromDTOList: (dtos: UserMetricLimitDto[]): Partial<UserMetricLimit>[] => {
    return dtos.map(UserMetricLimitMapper.fromDTO);
  },
};