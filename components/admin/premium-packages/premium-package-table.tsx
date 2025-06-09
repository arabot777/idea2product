"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PremiumPackageDto } from "@/lib/types/billing/premium-package.dto";
import { listPremiumPackages } from "@/app/actions/billing/list-premium-packages";
import { AppError } from "@/lib/types/app.error";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

export function PremiumPackageTable() {
  const [premiumPackages, setPremiumPackages] = useState<PremiumPackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations("PremiumPackageTable");

  useEffect(() => {
    fetchPremiumPackages();
  }, []);

  const fetchPremiumPackages = async () => {
    setLoading(true);
    try {
      const fetchedPremiumPackages = await listPremiumPackages();
      setPremiumPackages(fetchedPremiumPackages);
    } catch (error) {
      const errorMessage =
        error instanceof AppError
          ? error.message
          : t("errorLoadingPremiumPackages");
      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add delete/disable functionality later
  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }
    // Implement delete action here
    toast({
      title: t("success"),
      description: t("deleteSuccess"),
    });
    fetchPremiumPackages(); // Refresh the list
  };

  if (loading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead>{t("table.description")}</TableHead>
            <TableHead>{t("table.price")}</TableHead>
            <TableHead>{t("table.currency")}</TableHead>
            <TableHead>{t("table.isActive")}</TableHead>
            <TableHead>{t("table.createdAt")}</TableHead>
            <TableHead>{t("table.updatedAt")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {premiumPackages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                {t("noPremiumPackages")}
              </TableCell>
            </TableRow>
          ) : (
            premiumPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>{pkg.description}</TableCell>
                <TableCell>{pkg.price}</TableCell>
                <TableCell>{pkg.currency}</TableCell>
                <TableCell>{pkg.isActive ? t("yes") : t("no")}</TableCell>
                <TableCell>{format(new Date(pkg.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell>{format(new Date(pkg.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/premium-packages/${pkg.id}`}>
                    <Button variant="outline" size="sm" className="mr-2">
                      {t("edit")}
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    {t("delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}