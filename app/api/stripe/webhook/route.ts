import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import Stripe from 'stripe';
import { updateTransactionStatus } from '@/app/actions/billing/update-transaction-status';
import { TransactionStatus } from '@/lib/db/schemas/payment/transaction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Updated API version
});

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const t = await getTranslations('ApiStripeWebhookRoute');
  if (!stripeWebhookSecret) {
    console.error('stripeWebhookSecretNotSet');
    return new NextResponse(t('stripeWebhookSecretNotConfigured'), { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, stripeWebhookSecret);
  } catch (err: any) {
    console.error(`webhookSignatureVerificationFailed: ${err.message}`);
    return new NextResponse(`${t('webhookError')}${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      console.log(`checkoutSessionCompleted: ${checkoutSession.id}`);
      if (checkoutSession.metadata?.sessionId) {
        await updateTransactionStatus(checkoutSession.metadata.sessionId, 'completed');
      } else {
        console.warn(`checkoutSessionMissingSessionId: ${checkoutSession.id}`);
      }
      break;
    case 'invoice.payment_succeeded':
      const invoicePaymentSucceeded = event.data.object as Stripe.Invoice;
      console.log(`invoicePaymentSucceeded: ${invoicePaymentSucceeded.id}`);
      // Implement logic for successful invoice payments, e.g., update subscription status
      break;
    case 'charge.failed':
      const chargeFailed = event.data.object as Stripe.Charge;
      console.log(`chargeFailed: ${chargeFailed.id}`);
      // Implement logic for failed charges, e.g., update transaction status to failed
      if (chargeFailed.metadata?.sessionId) {
        await updateTransactionStatus(chargeFailed.metadata.sessionId, 'failed');
      } else {
        console.warn(`chargeMissingSessionId: ${chargeFailed.id}`);
      }
      break;
    case 'charge.refunded':
      const chargeRefunded = event.data.object as Stripe.Charge;
      console.log(`chargeRefunded: ${chargeRefunded.id}`);
      // Implement logic for refunded charges, e.g., update transaction status to refunded
      if (chargeRefunded.metadata?.sessionId) {
        await updateTransactionStatus(chargeRefunded.metadata.sessionId, 'refunded');
      } else {
        console.warn(`chargeRefundedMissingSessionId: ${chargeRefunded.id}`);
      }
      break;
    // Add more event types as needed
    default:
      console.log(`unhandledEventType: ${event.type}`);
  }

  return new NextResponse(t('ok'), { status: 200 });
}

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'edge', // Ensure this is an Edge function
};