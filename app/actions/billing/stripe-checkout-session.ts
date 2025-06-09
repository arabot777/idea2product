"use server";

import { getTranslations } from 'next-intl/server';

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { PremiumPackageEdit } from "@/lib/db/crud/billing/premium-package.edit";
import { PremiumPackageMapper } from "@/lib/mappers/billing/premium-package";
import { AppError } from "@/lib/types/app.error";
import { PremiumPackageDto, PremiumPackageDtoSchema } from "@/lib/types/billing/premium-package.dto";
import { NewPremiumPackage } from "@/lib/db/schemas/billing/premium-package";
import { PremiumPackageQuery } from "@/lib/db/crud/billing/premium-package.query";
import { SubscriptionPlanQuery } from "@/lib/db/crud/billing/subscription-plan.query";
import { StripeProductQuery } from "@/lib/db/crud/billing/stripe-product.query";
import { StripeProductEdit } from "@/lib/db/crud/billing/stripe-product.edit";
import { NewStripeProduct } from "@/lib/db/schemas/billing/stripe-product";
import { TransactionEdit } from "@/lib/db/crud/payment/transaction.edit";
import { NewTransaction } from "@/lib/db/schemas/payment/transaction";
import { BillingCycle, BillingStatus } from "@/lib/types/billing/enum.bean";
import Stripe from "stripe";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { createClient } from "@/lib/supabase/server";
import { UserSubscriptionPlanQuery } from "@/lib/db/crud/billing/user-subscription-plan.query";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const stripeCheckoutSession = dataActionWithPermission(
  "stripeCheckoutSession",
  async (input: { premiumPackageId?: string; subscriptionPlanId?: string }, userContext: UserContext): Promise<{ sessionId: string }> => {
    const { premiumPackageId, subscriptionPlanId } = input;

    const t = await getTranslations('BillingStripeCheckoutSession');
    if (!premiumPackageId && !subscriptionPlanId) {
      throw new AppError("VALIDATION_ERROR", t('validationError.premiumPackageAndSubscriptionPlanRequired'));
    }

    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", t('unauthorized.userNotFound'));
    }

    const existingSubscription = await UserSubscriptionPlanQuery.getByUserIdAndStatus(user.id, BillingStatus.ACTIVE);
    if (existingSubscription) {
      throw new AppError("VALIDATION_ERROR", "User already has an active subscription, cannot subscribe again.");
    }

    try {
      let stripeProductId;
      let stripePriceId;
      let amount;
      let currency;
      if (premiumPackageId) {
        const premiumPackage = await PremiumPackageQuery.getById(premiumPackageId);
        if (!premiumPackage) {
          throw new AppError("NOT_FOUND", t('notFound.premiumPackageNotFound', { premiumPackageId }));
        }
        const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;
        const stripeAccountId = `${process.env.STRIPE_ACCOUNT_ID}:${isTestMode ? "test" : "live"}`;
        const priceUnitAmount = Math.round(premiumPackage.price * 100);
        if (priceUnitAmount <= 50) {
          throw new AppError("VALIDATION_ERROR", t('validationError.premiumPackagePriceTooLow'));
        }

        const stripeProduct = await StripeProductQuery.getBySource(
          premiumPackage.id,
          "premium_package",
          stripeAccountId,
          premiumPackage.currency,
          priceUnitAmount,
          premiumPackage.name,
          premiumPackage.description
        );
        if (!stripeProduct) {
          const product = await stripe.products.create({
            name: premiumPackage.name,
            description: premiumPackage.description,
          });

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceUnitAmount,
            currency: premiumPackage.currency,
          });
          stripeProductId = product.id;
          stripePriceId = price.id;
          amount = priceUnitAmount;
          currency = premiumPackage.currency;

          const stripeProduct: NewStripeProduct = {
            sourceId: premiumPackage.id,
            sourceType: "premium_package",
            stripeAccountId,
            productId: stripeProductId,
            productName: premiumPackage.name,
            productDescription: premiumPackage.description,
            priceId: stripePriceId,
            priceUnitAmount,
            priceCurrency: premiumPackage.currency,
          };
          await StripeProductEdit.create(stripeProduct);
        } else {
          stripeProductId = stripeProduct.productId;
          stripePriceId = stripeProduct.priceId;
          amount = stripeProduct.priceUnitAmount;
          currency = stripeProduct.priceCurrency;
        }
      } else if (subscriptionPlanId) {
        const subscriptionPlan = await SubscriptionPlanQuery.getById(subscriptionPlanId);
        if (!subscriptionPlan) {
          throw new AppError("NOT_FOUND", t('notFound.subscriptionPlanNotFound', { subscriptionPlanId }));
        }
        const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;
        const stripeAccountId = `${process.env.STRIPE_ACCOUNT_ID}:${isTestMode ? "test" : "live"}`;
        const priceUnitAmount = Math.round(subscriptionPlan.price * 100);
        if (priceUnitAmount <= 50) {
          throw new AppError("VALIDATION_ERROR", t('validationError.subscriptionPlanPriceTooLow'));
        }
        const stripeProduct = await StripeProductQuery.getBySource(
          subscriptionPlan.id,
          "subscription_plan",
          stripeAccountId,
          subscriptionPlan.currency,
          priceUnitAmount,
          subscriptionPlan.name,
          subscriptionPlan.description
        );
        if (!stripeProduct) {
          const product = await stripe.products.create({
            name: subscriptionPlan.name,
            description: subscriptionPlan.description,
          });

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceUnitAmount,
            currency: subscriptionPlan.currency,
            recurring: {
              interval: subscriptionPlan.billingCycle === BillingCycle.ANNUAL ? "year" : "month",
            },
          });
          stripeProductId = product.id;
          stripePriceId = price.id;
          amount = priceUnitAmount;
          currency = subscriptionPlan.currency;

          const stripeProduct: NewStripeProduct = {
            sourceId: subscriptionPlan.id,
            sourceType: "subscription_plan",
            stripeAccountId,
            productId: stripeProductId,
            productName: subscriptionPlan.name,
            productDescription: subscriptionPlan.description,
            priceId: stripePriceId,
            priceUnitAmount,
            priceCurrency: subscriptionPlan.currency,
            priceInterval: subscriptionPlan.billingCycle === BillingCycle.ANNUAL ? "year" : "month",
          };
          await StripeProductEdit.create(stripeProduct);
        } else {
          stripeProductId = stripeProduct.productId;
          stripePriceId = stripeProduct.priceId;
          amount = stripeProduct.priceUnitAmount;
          currency = stripeProduct.priceCurrency;
        }
      }
      if (!stripeProductId || !stripePriceId) {
        throw new AppError("NOT_FOUND", t('notFound.stripeProductNotFound'));
      }
      const transaction = await TransactionEdit.create({
        userId: userContext.id,
        type: subscriptionPlanId ? "payment_subscription_plan" : "payment_premium_package",
        associatedId: subscriptionPlanId || premiumPackageId || "",
        amount: amount!,
        currency: currency!,
        status: "pending",
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: subscriptionPlanId ? "subscription" : "payment",
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: userContext.email,
        metadata: {
          userId: userContext.id,
          type: subscriptionPlanId ? "payment_subscription_plan" : "payment_premium_package",
          productId: subscriptionPlanId || premiumPackageId || "",
        },
        success_url: `${process.env.NEXT_PUBLIC_URL || ""}/subscribe-plan/confirm?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL || ""}/subscribe-plan/confirm?session_id={CHECKOUT_SESSION_ID}`,
      });
      await TransactionEdit.update(transaction.id, { externalId: session.id });
      return { sessionId: session.id };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("DATABASE_ERROR", error.message || t('databaseError.failedToUpdatePremiumPackage'));
    }
  }
);
