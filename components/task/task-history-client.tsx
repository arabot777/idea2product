"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, ImageIcon } from "lucide-react";
import { HistoryListItem } from "@/components/task/history-list-item"; // Use the new list item component
import { TaskStatus, TaskStatusType } from "@/lib/types/task/enum.bean";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";
 
import { TaskDto } from "@/lib/types/task/task.dto";

interface TaskHistoryClientProps {
  tasks: TaskDto[];
  total: number;
  currentPage: number;
  currentStatus?: TaskStatusType;
  currentSearch?: string;
  itemsPerPage: number;
}

export function TaskHistoryClient({ tasks, total, currentPage, currentStatus, currentSearch, itemsPerPage }: TaskHistoryClientProps) {
  const t = useTranslations("TaskHistoryClient");
  const locale = useLocale();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      queryAppender({
        status: currentStatus,
        search: searchTerm,
        page: "1",
      })
    );
  };

  const queryAppender = (params: Record<string, string | null | undefined>) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    );
    const queryParams = new URLSearchParams();
    Object.entries(filteredParams).forEach(([key, value]) => {
      queryParams.set(key, value as string);
    });
    return `/${locale}/task/history?${queryParams.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{t("pageTitle")}</span>
          </h1>
          <p className="text-gray-400">{t("pageDescription")}</p>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" size="sm">
              {t("search")}
            </Button>
          </form>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("filter")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-100 text-black border-gray-200">
              <DropdownMenuItem>
                <Link href={queryAppender({ status: undefined, search: searchTerm, page: "1" })} className="block w-full h-full px-2 py-1.5 hover:bg-gray-200">
                  {t("all")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={queryAppender({ status: TaskStatus.COMPLETED, search: searchTerm, page: "1" })} className="block w-full h-full px-2 py-1.5 hover:bg-gray-200">
                  {t("completed")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={queryAppender({ status: TaskStatus.FAILED, search: searchTerm, page: "1" })} className="block w-full h-full px-2 py-1.5 hover:bg-gray-200">
                  {t("failed")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((item) => (
          <HistoryListItem key={item.id} item={item} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{searchTerm ? t("noMatchingRecords") : t("noRecordsYet")}</h3>
          <p className="text-gray-500">{searchTerm ? t("tryDifferentKeywords") : t("startYourFirstCreation")}</p>
        </div>
      )}

      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={t("previous")}
          nextLabel={t("next")}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={({ selected }) => {
            router.push(queryAppender({ status: currentStatus, search: searchTerm, page: (selected + 1).toString() }));
          }}
          containerClassName={"flex justify-center items-center space-x-2 mt-8"}
          pageClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          pageLinkClassName={"block"}
          activeClassName={"bg-purple-600 text-white"}
          previousClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          nextClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          forcePage={currentPage - 1} // react-paginate is 0-indexed
        />
      )}
    </div>
  );
}
