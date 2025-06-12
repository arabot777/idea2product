"use client";

import Navbar from "@/components/navbar";
import { TaskResultGridClient } from "@/components/task/task-result-grid-client";
import { TaskResultDto } from "@/lib/types/task/task-result.dto";
import { getTaskResults } from "@/app/actions/task/get-task-results";
import { TaskResultTypeType } from "@/lib/types/task/enum.bean";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface ResultPageProps {}

const ITEMS_PER_PAGE = 12; // Define items per page for grid layout

export default function ResultPage() {
  const t = useTranslations("TaskResultGridClient"); // Assuming a translation key for this page
  const [taskResults, setTaskResults] = useState<TaskResultDto[]>([]); // Adjust type if TaskResultDto is available
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useSearchParams();
  const searchStringRef = useRef<string | null>(null);

  const router = useRouter();

  const currentPage = parseInt(params.get("page") || "1");
  const currentSearch = params.get("search") || undefined;
  const currentType = params.get("type") as TaskResultTypeType | undefined;
  const taskId = params.get("taskId") as string | undefined;
  console.log("searchString", searchStringRef.current);

  useEffect(() => {
    const newSearchString = params.toString();
    if (searchStringRef.current === newSearchString) {
      return;
    }
    searchStringRef.current = newSearchString;

    const fetchTaskResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, total } = await getTaskResults({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          search: currentSearch,
          filter: {
            taskId,
            type: currentType,
          },
        });
        setTaskResults(data);
        setTotal(total);
      } catch (err) {
        console.error("Error fetching task results:", err);
        setError(t("error.fetchingData") || "Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskResults();
  }, [params, currentPage, currentSearch, currentType, taskId]);

  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        {
          <TaskResultGridClient
            isLoading={loading}
            error={error || ""}
            taskResults={taskResults}
            total={total}
            currentPage={currentPage}
            currentType={currentType}
            currentSearch={currentSearch}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        }
      </div>
    </section>
  );
}
