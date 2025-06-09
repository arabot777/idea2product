"use server";

import { getTranslations } from 'next-intl/server';

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { AppError } from "@/lib/types/app.error";
import { TransactionQuery } from "@/lib/db/crud/payment/transaction.query";
import { TransactionDto, TransactionDtoSchema } from "@/lib/types/payment/transaction.dto";
import { PageParams } from "@/utils/drizzle.page";
import { UserContext } from "@/lib/types/auth/user-context.bean";

export const getUserTransactions = dataActionWithPermission(
  "getUserTransactions",
  async (
    params: PageParams<TransactionDto>,
    userContext: UserContext
  ): Promise<{ data: TransactionDto[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }> => {
    try {
      const paginationParams = {
        ...params,
        filter: {
          ...params?.filter,
          userId: userContext.id,
        },
      };

      const transactionsResult = await TransactionQuery.getPagination(paginationParams);

      const data: TransactionDto[] = transactionsResult.data.map((transaction) => TransactionDtoSchema.parse(transaction));

      return {
        data,
        total: transactionsResult.total,
        page: transactionsResult.page,
        pageSize: transactionsResult.pageSize,
        totalPages: transactionsResult.totalPages,
        hasNext: transactionsResult.hasNext,
        hasPrevious: transactionsResult.hasPrevious,
      };
    } catch (error) {
      const t = await getTranslations('BillingGetUserTransactions');
      console.error('errorFetchingUserTransactions', error);
      if (error instanceof AppError) {
        throw error;
      }
      // Return empty array and 0 for all counts in case of unexpected errors
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }
);
