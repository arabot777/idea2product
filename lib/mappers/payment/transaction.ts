import { Transaction } from '../../db/schemas/payment/transaction';
import { TransactionDto } from '../../types/payment/transaction.dto';

export const TransactionMapper = {
  toDTO: (model: Transaction): TransactionDto => {
    return {
      id: model.id,
      userId: model.userId,
      externalId: model.externalId,
      associatedId: model.associatedId,
      type: model.type,
      amount: model.amount,
      currency: model.currency,
      status: model.status,
      description: model.description,
      metadata: model.metadata as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: TransactionDto): Partial<Transaction> => {
    return {
      id: dto.id,
      userId: dto.userId,
      externalId: dto.externalId,
      associatedId: dto.associatedId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency,
      status: dto.status,
      description: dto.description,
      metadata: dto.metadata as Record<string, any> | null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDTOList: (models: Transaction[]): TransactionDto[] => {
    return models.map(TransactionMapper.toDTO);
  },

  fromDTOList: (dtos: TransactionDto[]): Partial<Transaction>[] => {
    return dtos.map(TransactionMapper.fromDTO);
  },
};