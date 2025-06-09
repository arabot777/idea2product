"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AuthStatus } from "@/lib/types/permission/permission-config.dto";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { updateAccountByAdmin } from "@/app/actions/auth/update-profile";
import { getRoles } from "@/app/actions/permission/get-roles";
import { RoleDto } from "@/lib/types/permission/role.dto";


interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
  onSuccess?: () => void;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const t = useTranslations("EditUserDialog");
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    roles: z.array(z.string()).min(1, t("form.roles.atLeastOneRequired")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roles: user?.roles || [],
    },
  });

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getRoles();
        setAvailableRoles(roles);
      } catch (error) {
        console.error("loadRolesFailed", error);
        toast.error(t("errors.loadRolesFailed"));
      }
    };

    if (open) {
      loadRoles();
      form.reset({ roles: user?.roles || [] });
    }
  }, [open, user?.roles, form, t]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Create form data with the roles
      const formData = new FormData();
      formData.append('roles', values.roles.join(","));
      
      // Call the server action with the form data
      await updateAccountByAdmin(formData);
      
      toast.success(t("success"));
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("updateFailed", error);
      toast.error(error.message || t("errors.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title", { email: user?.email })}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">{t("rolesLabel")}</FormLabel>
                  </div>
                  <div className="grid gap-2">
                    {availableRoles.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.name) || false}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, role.name])
                                      : field.onChange(
                                          field.value?.filter((value: string) => value !== role.name)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {role.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
