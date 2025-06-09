"use client";

import React, { useState } from "react";
import { ProfileDTO } from "@/lib/types/auth/profile.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EditUserDialog } from "./edit-user-dialog";

interface UserTableProps {
  users: ProfileDTO[];
  onUserUpdated?: () => void;
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onUserUpdated, isLoading = false }) => {
  const t = useTranslations("UserTable");
  const [editingUser, setEditingUser] = useState<{
    id: string;
    email: string;
    roles: string[];
  } | null>(null);

  const handleEditClick = (user: ProfileDTO) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      roles: user.roles || [],
    });
  };

  const handleUpdateSuccess = () => {
    toast.success(t("toast.updateSuccess"));
    onUserUpdated?.();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.id")}</TableHead>
            <TableHead>{t("table.email")}</TableHead>
            <TableHead>{t("table.username")}</TableHead>
            <TableHead>{t("table.fullName")}</TableHead>
            <TableHead>{t("table.roles")}</TableHead>
            <TableHead>{t("table.createdAt")}</TableHead>
            <TableHead>{t("table.updatedAt")}</TableHead>
            <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                {t("loading")}
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                {t("noUsersFound")}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username || "-"}</TableCell>
              <TableCell>{user.full_name || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  )) || <span className="text-muted-foreground">-</span>}
                </div>
              </TableCell>
              <TableCell>{format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell>{format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(user)}
                  title={t("actions.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};