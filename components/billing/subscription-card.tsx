"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // New import
import { Check, Star, LucideIcon, HelpCircle } from "lucide-react"; // New import
import { SubscriptionPlanDto } from "@/lib/types/billing/subscription-plan.dto";
import { useTranslations } from "next-intl";

interface SubscriptionCardProps {
  plan: SubscriptionPlanDto & {
    icon: LucideIcon;
    popular: boolean;
    buttonText: string;
    buttonVariant: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
    features?: string[]; // Add features property
  };
  currentPlanId: string | null;
  submittingPlanId: string | null;
  onSubscribe: (planId: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, currentPlanId, submittingPlanId, onSubscribe }) => {
  const IconComponent = plan.icon;
  const t = useTranslations("SubscriptionCard");
  const [descriptionTooltip, setDescriptionTooltip] = useState(false);
  const [featureTooltips, setFeatureTooltips] = useState<{[key: number]: boolean}>({});

  const toggleDescriptionTooltip = () => setDescriptionTooltip(!descriptionTooltip);
  const toggleFeatureTooltip = (index: number) => {
    setFeatureTooltips(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  return (
    <Card
      className={`relative w-80 h-[500px] bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl transition-all duration-300 hover:shadow-xl ${
        plan.popular ? "ring-2 ring-blue-500/50 scale-105" : "hover:border-blue-500/30"
      }`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 shadow-lg">
            <Star className="w-3 h-3 mr-1" />
            {t("mostPopular")}
          </Badge>
        </div>
      )}
      {plan.id === currentPlanId && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 shadow-lg">{t("currentPlan")}</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              plan.popular ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-slate-700"
            }`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2 truncate" title={plan.name}>
          {plan.name}
        </CardTitle>
        <div className="flex items-baseline justify-center mb-2">
          <span className="text-4xl font-bold text-white">
            {plan.currency === "cny" ? "¥" : "$"}
            {plan.price}
          </span>
          <span className="text-slate-400 ml-1">/{t(`${plan.billingCycle}`)}</span>
        </div>
        {plan.description && (
          <div className="relative">
            <p className="text-slate-400 min-h-[48px] leading-6 line-clamp-2 overflow-hidden text-ellipsis pr-6">
              {plan.description}
            </p>
            {plan.description.length > 80 && (
              <div className="absolute top-1 right-0">
                <div className="relative">
                  <button
                    className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-700/50"
                    onMouseEnter={toggleDescriptionTooltip}
                    onMouseLeave={toggleDescriptionTooltip}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {descriptionTooltip && (
                    <div className="absolute top-6 right-0 z-10 w-64 bg-slate-900/95 backdrop-blur-sm text-slate-100 text-sm p-3 rounded-lg shadow-xl border border-slate-700/50 whitespace-normal">
                      {plan.description}
                      <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <ul className="space-y-2 text-muted-foreground">
          {plan.features && Object.entries(plan.features).map(([key, value]) => (
            <li key={key} className="flex items-center">
              <span className="mr-2">{t("checkMark")}</span> {key}{t("colon")} {value}
            </li>
          ))}
        </ul>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-4 min-h-[120px]">
          {plan.features?.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center relative">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-slate-300 flex-1 truncate pr-8" title={feature}>
                {feature}
              </span>
              {feature && feature.length > 50 && (
                <div className="absolute top-1 right-1">
                  <div className="relative">
                    <button
                      className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-700/50"
                      onMouseEnter={() => toggleFeatureTooltip(featureIndex)}
                      onMouseLeave={() => toggleFeatureTooltip(featureIndex)}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    {featureTooltips[featureIndex] && (
                      <div className="absolute top-6 right-0 z-10 w-64 bg-slate-900/95 backdrop-blur-sm text-slate-100 text-sm p-3 rounded-lg shadow-xl border border-slate-700/50 whitespace-normal">
                        {feature}
                        <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <Button
          className={`w-full h-12 font-medium transition-all duration-300 ${
            plan.buttonVariant === "default"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25"
              : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          variant={plan.buttonVariant}
          onClick={() => onSubscribe(plan.id)}
          disabled={submittingPlanId === plan.id}>
          {submittingPlanId === plan.id ? t("submitting") : plan.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
