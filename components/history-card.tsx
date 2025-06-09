"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Share2, Trash2, MoreVertical, Calendar } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { TaskDto } from "@/lib/types/task/task.dto";
import { format } from "date-fns";

export function HistoryCard({ item }: { item: TaskDto }) {
  const t = useTranslations("HistoryCard")

  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden group hover:border-purple-500/50 transition-colors">
      <div className="relative">
        <Image
          src={"/placeholder.svg"} // Task does not have an image property directly
          alt={t("generatedImageAlt")}
          width={256}
          height={256}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant={item.status === "completed" ? "default" : "destructive"} className="text-xs">
            {item.type}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={item.status === "completed" ? "secondary" : "destructive"} className="text-xs">
            {item.status === "completed" ? t("statusCompleted") : t("statusFailed")}
          </Badge>
        </div>
        {/* Removed hover actions for simplicity, can be re-added if needed with proper data */}
        {/* <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div> */}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">{item.title || item.description || t("noTitleOrDescription")}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {format(item.createdAt, "yyyy-MM-dd HH:mm")}
            </div>
          </div>

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
      </CardContent>
    </Card>
  )
}