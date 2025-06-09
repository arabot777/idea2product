import { TaskDataDto } from "../../types/task/task-data.dto";
import { TaskData, NewTaskData } from "../../db/schemas/task/task-data";

export const TaskDataMapper = {
  toDTO: (model: TaskData): TaskDataDto => {
    return {
      id: model.id,
      taskId: model.taskId,
      inputData: model.inputData,
      outputData: model.outputData,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  },

  fromDTO: (dto: TaskDataDto): Partial<NewTaskData> => {
    return {
      taskId: dto.taskId,
      inputData: dto.inputData,
      outputData: dto.outputData,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  },

  toDTOList: (models: TaskData[]): TaskDataDto[] => {
    return models.map(TaskDataMapper.toDTO);
  },

  fromDTOList: (dtos: TaskDataDto[]): Partial<NewTaskData>[] => {
    return dtos.map(TaskDataMapper.fromDTO);
  },
};