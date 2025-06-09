import { TaskDto } from "../../types/task/task.dto";
import { TaskStatusType } from "../../types/task/enum.bean";
import { Task, NewTask } from "../../db/schemas/task/task";

export const TaskMapper = {
  toDTO: (model: Task): TaskDto => {
    return {
      id: model.id,
      userId: model.userId,
      parentTaskId: model.parentTaskId,
      type: model.type,
      status: model.status as TaskStatusType,
      title: model.title,
      description: model.description,
      progress: model.progress,
      startedAt: model.startedAt?.toISOString() || null,
      endedAt: model.endedAt?.toISOString() || null,
      checkedAt: model.checkedAt?.toISOString() || null,
      checkInterval: model.checkInterval,
      message: model.message,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  },

  fromDTO: (dto: TaskDto): Partial<NewTask> => {
    return {
      userId: dto.userId,
      parentTaskId: dto.parentTaskId,
      type: dto.type,
      status: dto.status,
      title: dto.title,
      description: dto.description,
      progress: dto.progress,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
      endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
      checkedAt: dto.checkedAt ? new Date(dto.checkedAt) : null,
      checkInterval: dto.checkInterval,
      message: dto.message,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  },

  toDTOList: (models: Task[]): TaskDto[] => {
    return models.map(TaskMapper.toDTO);
  },

  fromDTOList: (dtos: TaskDto[]): Partial<NewTask>[] => {
    return dtos.map(TaskMapper.fromDTO);
  },
};