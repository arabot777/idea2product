"use client"

import { TaskDto } from "@/lib/types/task/task.dto";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Download, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

interface HistoryListItemProps {
  item: TaskDto;
}

export function HistoryListItem({ item }: HistoryListItemProps) {
  const t = useTranslations("HistoryListItem");

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-gray-200 truncate">{item.title || item.description || t("noTitleOrDescription")}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
          <span>{item.type}</span>
          <Badge variant={item.status === "completed" ? "default" : "destructive"} className="text-xs">
            {item.status === "completed" ? t("statusCompleted") : t("statusFailed")}
          </Badge>
          <span>{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800" align="end">
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              {t("download")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              {t("share")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}