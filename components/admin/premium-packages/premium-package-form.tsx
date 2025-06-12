"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { PremiumPackageDto, PremiumPackageDtoSchema } from "@/lib/types/billing/premium-package.dto";
import { createPremiumPackage } from "@/app/actions/billing/create-premium-package";
import { updatePremiumPackage } from "@/app/actions/billing/update-premium-package";
import { useRouter } from "next/navigation";

interface PremiumPackageFormProps {
  initialData?: PremiumPackageDto | null;
}

// Use PremiumPackageDtoSchema as base, but make id, createdAt, and updatedAt optional


export const PremiumPackageForm: React.FC<PremiumPackageFormProps> = ({
  initialData,
}) => {
  const { toast } = useToast();
  const t = useTranslations("PremiumPackageForm");
  const router = useRouter();

  // Use PremiumPackageDtoSchema as base, but make id, createdAt, and updatedAt optional
  const formSchema = z.object({
    name: z.string().min(1, t("nameRequired")),
    description: z.string(),
    price: z.number(),
    currency: z.string(),
    isActive: z.boolean(),
    metadata: z.record(z.any()).nullable(),
    id: z.string().uuid().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
  }).refine(
    (data) => {
      if (data.id === "new" && !data.name) {
        return false; // Name is required for new packages
      }
      return true;
    },
    {
      message: t("nameRequiredForNewPackages"),
      path: ["name"],
    }
  );

  const defaultValues: z.infer<typeof formSchema> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    currency: initialData?.currency || "usd",
    isActive: initialData?.isActive ?? true,
    metadata: initialData?.metadata ?? null,
    ...(initialData?.id && { id: initialData.id }),
    ...(initialData?.createdAt && { createdAt: initialData.createdAt }),
    ...(initialData?.updatedAt && { updatedAt: initialData.updatedAt })
  };

  type PremiumPackageFormValues = z.infer<typeof formSchema>;

  const form = useForm<PremiumPackageFormValues, any, PremiumPackageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData?.id) {
        // Update existing premium package
        await updatePremiumPackage({ id: initialData.id!, ...values } as PremiumPackageDto);
        toast({
          title: t("common.success"),
          description: t("premiumPackageUpdatedSuccessfully"),
        });
      } else {
        // Create new premium package
        await createPremiumPackage(values as PremiumPackageDto);
        toast({
          title: t("common.success"),
          description: t("premiumPackageCreatedSuccessfully"),
        });
        router.push("/admin/premium-packages"); // Redirect to list page after creation
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("failedToSavePremiumPackage"),
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("common.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.description")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("common.descriptionPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.price")}</FormLabel>
              <FormControl>
                <Input type="number" placeholder={t("common.pricePlaceholder")} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.currency")}</FormLabel>
              <FormControl>
                <Input placeholder={t("common.currencyPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("common.isActive")}</FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">{t("common.save")}</Button>
      </form>
    </FormProvider>
  );
};