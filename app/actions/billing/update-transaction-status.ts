"use server";

import { TransactionQuery } from '@/lib/db/crud/payment/transaction.query';
import { TransactionEdit } from '@/lib/db/crud/payment/transaction.edit';
import { Transaction, TransactionStatus } from '@/lib/db/schemas/payment/transaction';
import { SubscriptionPlanQuery } from '@/lib/db/crud/billing/subscription-plan.query';
import { SubscriptionPlan } from '@/lib/db/schemas/billing/subscription-plan';
import { getTranslations } from 'next-intl/server';
import Stripe from 'stripe';

export type UpdateTransactionStatusResult = {
  success: boolean;
  message: string;
  transaction?: Transaction | null;
  plan?: SubscriptionPlan | null;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil', // Updated API version based on error message
});

export async function updateTransactionStatus(sessionId: string, status: TransactionStatus): Promise<UpdateTransactionStatusResult> {
  const t = await getTranslations('BillingUpdateTransactionStatus');
  try {
    let transaction = await TransactionQuery.getBySessionId(sessionId);
    let plan: SubscriptionPlan | null | undefined;

    if (!transaction) {
      console.warn(`transactionNotFound (Session ID: ${sessionId})`);
      return { success: false, message: t('transactionNotFound', { sessionId }) };
    }

    if (transaction.type === 'payment_subscription_plan' && transaction.associatedId) {
      plan = await SubscriptionPlanQuery.getById(transaction.associatedId);
    }

    if (status === "completed") {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        if (transaction.status === status) {
          console.log(`transactionAlreadyHasStatusNoUpdate (Transaction ID: ${transaction.id}, Status: ${status})`);
          return { success: true, message: t('transactionAlreadyHasStatus', { status }), transaction, plan };
        }
        await TransactionEdit.update(transaction.id, { status });
        transaction = await TransactionQuery.getById(transaction.id); // Re-fetch to get the latest
        return { success: true, message: t('transactionStatusUpdated', { transactionId: transaction?.id ?? '', status }), transaction, plan };
      } else {
        console.warn(`stripeSessionNotPaid (Session ID: ${sessionId}, Payment Status: ${session.payment_status})`);
        return { success: false, message: t('stripeSessionNotPaid', { sessionId, paymentStatus: session.payment_status }) };
      }
    } else {
      if (transaction.status === status) {
        console.log(`transactionAlreadyHasStatusNoUpdate (Transaction ID: ${transaction.id}, Status: ${status})`);
        return { success: true, message: t('transactionAlreadyHasStatus', { status }), transaction, plan };
      }
      await TransactionEdit.update(transaction.id, { status });
      transaction = await TransactionQuery.getById(transaction.id); // Re-fetch to get the latest
      return { success: true, message: t('transactionStatusUpdated', { transactionId: transaction?.id ?? '', status }), transaction, plan };
    }
  } catch (error) {
    console.error(`failedToUpdateTransactionStatusForSessionId (Session ID: ${sessionId})`, error);
    return { success: false, message: t('failedToUpdateTransactionStatus', { errorMessage: (error as Error).message }) };
  }
}