"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AggregationType,
  BillableMetricDto,
  BillableMetricSchema,
  MetricType,
  aggregationTypeLabels,
  metricTypeLabels,
} from "@/lib/types/unibee/billable-metric-dto";
import { createBillableMetric } from "@/app/actions/unibee/create-billable-metric";
import { updateBillableMetric } from "@/app/actions/unibee/update-billable-metric";
import { toast } from "sonner";
import { CODE } from "@/lib/unibean/metric-code";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getFeatureCalculator } from "@/sdk/wavespeed/code-mapping";

const formSchema = BillableMetricSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  unibeeExternalId: true,
});

interface BillableMetricFormProps {
  metric: BillableMetricDto | null;
  onSuccess: () => void;
}

export const aggregationTypes = Object.entries(aggregationTypeLabels).map(([key, value]) => ({
  value: parseInt(key),
  label: value,
}));

export const metricTypes = Object.entries(metricTypeLabels).map(([key, value]) => ({
  value: parseInt(key),
  label: value,
}));

const codeOptions = Object.entries(CODE).map(([label, value]) => ({ label: value, value }));

function CodeSelector({ field, onSelect, disabled }: { field: any; onSelect?: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = searchTerm
    ? codeOptions.filter(
        (option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()) || option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : codeOptions;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={disabled}>
          {field.value ? codeOptions.find((o) => o.value === field.value)?.label : "Select a code"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <Input 
            placeholder="Search code..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-1" 
            disabled={disabled}
          />
        </div>
        <div className="max-h-[300px] overflow-auto">
          <div className="grid gap-1 py-2">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No code found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center rounded-md px-3 py-2 text-sm",
                    field.value === option.value ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => {
                    if (!disabled && onSelect) {
                      onSelect(option.value);
                      setOpen(false);
                    }
                  }}>
                  <Check className={cn("mr-2 h-4 w-4", field.value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillableMetricForm({ metric, onSuccess }: BillableMetricFormProps) {
  const isEditMode = Boolean(metric);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricName: metric?.metricName || "",
      metricDescription: metric?.metricDescription || "",
      code: metric?.code || "",
      aggregationType: metric?.aggregationType || 5,
      aggregationProperty: metric?.aggregationProperty || "",
      type: metric?.type || 1,
      featureCalculator: metric?.featureCalculator || "",
      displayDescription: metric?.displayDescription || "",
    },
  });

  // Handle code selection and update featureCalculator accordingly
  const handleCodeSelect = (code: string) => {
    const isCodeChanged = form.getValues('code') !== code;
    form.setValue('code', code);
    // Only update featureCalculator if it's empty or code has changed
    if (!form.getValues('featureCalculator') || isCodeChanged) {
      const calculator = getFeatureCalculator(code);
      form.setValue('featureCalculator', calculator);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = metric ? await updateBillableMetric({ ...values, id: metric.id }) : await createBillableMetric(values);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function onErrors(errors: any) {
    let errorMessage = "Form validation failed:\n";
    for (const fieldName in errors) {
      if (errors[fieldName] && errors[fieldName].message) {
        errorMessage += `- ${fieldName}: ${errors[fieldName].message}\n`;
      } else if (errors[fieldName] && typeof errors[fieldName] === "object") {
        // Handle nested errors for complex objects if any
        for (const nestedFieldName in errors[fieldName]) {
          if (errors[fieldName][nestedFieldName] && errors[fieldName][nestedFieldName].message) {
            errorMessage += `- ${fieldName}.${nestedFieldName}: ${errors[fieldName][nestedFieldName].message}\n`;
          }
        }
      }
    }
    toast.error(errorMessage);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onErrors)} className="space-y-8">
        <FormField
          control={form.control}
          name="metricName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metric Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. API Calls" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <CodeSelector field={field} onSelect={isEditMode ? undefined : handleCodeSelect} disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metricDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="A short description" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Description</FormLabel>
              <FormControl>
                <Input placeholder="A user-friendly description" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={isEditMode ? undefined : (value: string) => field.onChange(parseInt(value, 10))} 
                defaultValue={String(field.value)}
                disabled={isEditMode}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a metric type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {metricTypes.map((type) => (
                    <SelectItem key={type.value} value={String(type.value)}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aggregationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aggregation Type</FormLabel>
              <Select 
                onValueChange={isEditMode ? undefined : (value: string) => field.onChange(parseInt(value, 10))} 
                defaultValue={String(field.value)}
                disabled={isEditMode}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an aggregation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {aggregationTypes.map((type) => (
                    <SelectItem key={type.value} value={String(type.value)}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="aggregationProperty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aggregation Property</FormLabel>
              <FormControl>
                <Input placeholder="e.g. user_id" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="featureCalculator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Calculator</FormLabel>
              <FormControl>
                <Input placeholder="e.g. default" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </FormProvider>
  );
}
