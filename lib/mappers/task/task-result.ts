import { TaskResultDto } from "../../types/task/task-result.dto";
import { TaskResult, NewTaskResult } from "../../db/schemas/task/task-result";
import { TaskResultStatusType, TaskResultTypeType } from "../../types/task/enum.bean";

export const TaskResultMapper = {
  toDTO: (model: TaskResult): TaskResultDto => {
    return {
      id: model.id,
      userId: model.userId,
      taskId: model.taskId,
      parentTaskId: model.parentTaskId,
      type: model.type as TaskResultTypeType,
      status: model.status as TaskResultStatusType,
      message: model.message,
      content: model.content,
      storageUrl: model.storageUrl,
      mimeType: model.mimeType,
      width: model.width,
      height: model.height,
      duration: model.duration,
      fileMimeType: model.fileMimeType,
      fileSize: model.fileSize,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  },

  fromDTO: (dto: TaskResultDto): Partial<NewTaskResult> => {
    return {
      userId: dto.userId,
      taskId: dto.taskId,
      parentTaskId: dto.parentTaskId,
      type: dto.type,
      status: dto.status,
      message: dto.message,
      content: dto.content,
      storageUrl: dto.storageUrl,
      mimeType: dto.mimeType,
      width: dto.width,
      height: dto.height,
      duration: dto.duration,
      fileMimeType: dto.fileMimeType,
      fileSize: dto.fileSize,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  },

  toDTOList: (models: TaskResult[]): TaskResultDto[] => {
    return models.map(TaskResultMapper.toDTO);
  },

  fromDTOList: (dtos: TaskResultDto[]): Partial<NewTaskResult>[] => {
    return dtos.map(TaskResultMapper.fromDTO);
  },
};