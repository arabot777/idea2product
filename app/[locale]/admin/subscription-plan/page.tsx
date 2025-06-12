"use client";

import { Suspense, useTransition } from "react";
import { SubscriptionPlanList } from "@/components/subscription/subscription-plan-list";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { unibeeSyncSubscriptionPlan } from "@/app/actions/billing/unibee-sync-subscription-plan";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubscriptionAdminPage() {
  const t = useTranslations("SubscriptionAdminPage");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = () => {
    startTransition(async () => {
      try {
        const success = await unibeeSyncSubscriptionPlan();
        if (!success) {
          toast(t("syncFailed"));
        } else {
          toast(t("syncSuccess"));
          router.refresh();
        }
      } catch (error: any) {
        toast(`${t("syncFailed")},${error?.message || "unknown error"}`);
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button onClick={handleSync} disabled={isPending}>
          {isPending ? t("syncing") : t("syncSubscriptionButton")}
        </Button>
      </div>

      <Suspense fallback={<div>{t("loadingSubscriptionPlanList")}</div>}>
        <SubscriptionPlanList />
      </Suspense>
    </div>
  );
}
