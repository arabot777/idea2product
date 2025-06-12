import { db } from '../../drizzle';
import { transactions, Transaction } from '../../schemas/payment/transaction';
import { and, eq, isNull, or, notInArray } from 'drizzle-orm';
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

  static async getUnfinishedTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const finalStatuses = ['completed', 'failed', 'canceled', 'refunded'];
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          or(
            // Case 1: Pending and not yet linked to an external transaction
            and(eq(transactions.status, 'pending'), isNull(transactions.externalId)),
            // Case 2: Already linked but not in a final state
            and(notInArray(transactions.status, finalStatuses))
          )
        )
      )
      .orderBy(transactions.createdAt);
  }

  static async getPagination(params: PageParams<Transaction>): Promise<PaginationResult<Transaction>> {
    return DrizzlePageUtils.pagination<Transaction>(transactions, params);
  }

  static async getBySessionId(sessionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.externalId, sessionId));
    return transaction;
  }
}