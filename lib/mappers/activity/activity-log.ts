import { ActivityLog } from '../../db/schemas/activity/activity-log';
import { ActivityLogDTO } from '../../types/activity/activity-log.dto';

export const ActivityLogMapper = {
  toDTO: (model: ActivityLog): ActivityLogDTO => {
    return {
      id: model.id,
      userId: model.userId,
      action: model.action,
      timestamp: model.timestamp,
      ipAddress: model.ipAddress,
    };
  },

  fromDTO: (dto: ActivityLogDTO): Partial<ActivityLog> => {
    return {
      id: dto.id,
      userId: dto.userId,
      action: dto.action,
      timestamp: dto.timestamp,
      ipAddress: dto.ipAddress,
    };
  },

  toDTOList: (models: ActivityLog[]): ActivityLogDTO[] => {
    return models.map(ActivityLogMapper.toDTO);
  },

  fromDTOList: (dtos: ActivityLogDTO[]): Partial<ActivityLog>[] => {
    return dtos.map(ActivityLogMapper.fromDTO);
  },
};