import { db } from '../../drizzle';
import { transactions, NewTransaction, Transaction } from '../../schemas/payment/transaction';
import { eq } from 'drizzle-orm';

export class TransactionEdit {
  static async create(newTransaction: NewTransaction): Promise<Transaction> {
    const [createdTransaction] = await db.insert(transactions).values(newTransaction).returning();
    return createdTransaction;
  }

  static async update(id: string, updatedFields: Partial<NewTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions).set(updatedFields).where(eq(transactions.id, id)).returning();
    return updatedTransaction;
  }

  static async delete(id: string): Promise<Transaction | undefined> {
    const [deletedTransaction] = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return deletedTransaction;
  }
}