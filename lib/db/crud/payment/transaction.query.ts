import { db } from '../../drizzle';
import { transactions, Transaction } from '../../schemas/payment/transaction';
import { eq } from 'drizzle-orm';
import { DrizzlePageUtils, PageParams, PaginationResult } from '@/utils/drizzle.page';

export class TransactionQuery {
  static async getById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  static async getAll(): Promise<Transaction[]> {
    return db.select().from(transactions);
  }

  static async getByUserId(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  static async getPagination(params: PageParams<Transaction>): Promise<PaginationResult<Transaction>> {
    return DrizzlePageUtils.pagination<Transaction>(transactions, params);
  }

  static async getBySessionId(sessionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.externalId, sessionId));
    return transaction;
  }
}