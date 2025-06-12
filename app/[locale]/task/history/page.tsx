"use client";

import Navbar from "@/components/navbar";
import { TaskHistoryClient } from "@/components/task/task-history-client";
import { TaskDto } from "@/lib/types/task/task.dto";
import { getTasks } from "@/app/actions/task/get-tasks";
import { TaskStatusType } from "@/lib/types/task/enum.bean";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface HistoryPageProps {}

const ITEMS_PER_PAGE = 10; // Define items per page

export default function HistoryPage() {
  const t = useTranslations("TaskHistoryPage");
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useSearchParams();
  const searchStringRef = useRef<string | null>(null);

  const router = useRouter();

  const currentPage = parseInt(params.get("page") || "1");
  const currentSearch = params.get("search") || undefined;
  const currentStatus = params.get("status") as TaskStatusType | undefined;
  console.log("searchString", searchStringRef.current);
  useEffect(() => {
    const newSearchString = params.toString();
    if (searchStringRef.current === newSearchString) {
      return;
    }
    searchStringRef.current = newSearchString;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, total } = await getTasks({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          search: currentSearch,
          filter: {
            status: currentStatus,
          },
        });
        setTasks(data);
        setTotal(total);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(t("error.fetchingData") || "Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [params, currentPage, currentSearch, currentStatus]);

  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        <TaskHistoryClient
          isLoading={loading}
          error={error || ""}
          tasks={tasks}
          total={total}
          currentPage={currentPage}
          currentStatus={currentStatus}
          currentSearch={currentSearch}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </section>
  );
}
