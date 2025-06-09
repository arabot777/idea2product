'use client';

import Navbar from "@/components/navbar"
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { stripeCheckoutSession } from '@/app/actions/billing/stripe-checkout-session';
import { listSubscriptionPlans } from '@/app/actions/billing/list-subscription-plans';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { toast } from 'sonner';
import { Check, Zap, Crown, Rocket, LucideIcon } from "lucide-react"; // Import icons and LucideIcon type
import SubscriptionCard from "@/components/billing/subscription-card"; // Import SubscriptionCard component
import useSWR from 'swr';

// Extend Plan type to include icon and popular properties
interface ExtendedPlan extends SubscriptionPlanDto {
  icon: LucideIcon;
  popular: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"; // Matches the variant type of shadcn/ui Button
  features?: string[]; // Add features property
}

const mapSubscriptionPlanDtoToPlan = (dto: SubscriptionPlanDto, t: ReturnType<typeof useTranslations>): ExtendedPlan => {
  let icon: LucideIcon = Zap; // Default icon
  let popular = false;
  let buttonText = t('subscribeNow');
  let buttonVariant: ExtendedPlan['buttonVariant'] = "default";

  // Determine icon and popular status based on plan name or price
  if (dto.name.includes(t('freePlanName'))) {
    icon = Zap;
    buttonText = t('currentPlanButton');
    buttonVariant = "outline";
  } else if (dto.name.includes(t('proPlanName'))) {
    icon = Crown;
    popular = true; // Assume Pro plan is the most popular
    buttonText = t('subscribeNow');
    buttonVariant = "default";
  } else if (dto.name.includes(t('enterprisePlanName'))) {
    icon = Rocket;
    buttonText = t('contactSalesButton');
    buttonVariant = "outline";
  }

  return {
    ...dto,
    icon: icon,
    popular: popular,
    buttonText: buttonText,
    buttonVariant: buttonVariant,
    features: dto.metadata?.features ? Object.values(dto.metadata.features).map(f => String(f)) : [], // Extract features
  };
};

const SubscribePage: React.FC = () => {
  const t = useTranslations('BillingSubscribePlanPage'); // Use subscribePage's internationalization key
  const [plans, setPlans] = useState<ExtendedPlan[]>([]); // Use ExtendedPlan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null); // Modify state variable

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const fetchedPlansDto = await listSubscriptionPlans();
        const mappedPlans = fetchedPlansDto.map(planDto => mapSubscriptionPlanDtoToPlan(planDto, t));
        setPlans(mappedPlans);
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
        setError(t('loadError')); // Internationalized error message
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]); // Add t as a dependency

  const handleSubscribe = async (planId: string) => {
    if (submittingPlanId) {
      toast.error(t('hasSubscribeSubmitting'));
      return;
    }
    setSubmittingPlanId(planId); // Set to current planId when starting subscription operation
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        console.error('stripeLoadError');
        return;
      }

      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        console.error(`planNotFound ${planId}`);
        return;
      }

      // If it's a "Contact Sales" plan, do not redirect to Stripe
      if (selectedPlan.buttonText === t('contactSales')) { // Internationalization
        alert(t('contactSalesMessage')); // Internationalization
        return;
      }

      const { sessionId } = await stripeCheckoutSession({
        premiumPackageId: undefined,
        subscriptionPlanId: selectedPlan.id,
      });

      if (sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect failed:', error);
        }
      }
    } catch (error: any) {
      toast.error(`${t('subscriptionFailed')} ${error?.message || error}`);
    } finally {
      setSubmittingPlanId(null); // Reset to null when subscription operation is complete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Navbar /> {/* Add Navbar component */}
      {loading ? (
        <div className="pt-24 pb-16 flex items-center justify-center">
          <p className="text-white text-lg">{t('loadingPlans')}</p>
        </div>
      ) : error ? (
        <div className="pt-24 pb-16 flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      ) : (
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                {t('chooseYourPlanTitle')}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {" "}
                  {t('subscriptionPlan')}
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t('unlockAiCreation')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  currentPlanId={""}
                  onSubscribe={handleSubscribe}
                  submittingPlanId={submittingPlanId}
                />
              ))}
            </div>

            <div className="text-center mt-16 space-y-6">
              <p className="text-slate-400 text-lg">{t('trialInfo')}</p>
              <div className="flex justify-center space-x-8 text-sm text-slate-500">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  {t('securePayment')}
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  {t('instantActivation')}
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  {t('customerSupport')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribePage;