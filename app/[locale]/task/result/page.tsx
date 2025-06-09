import Navbar from "@/components/navbar"
import { TaskResultGridClient } from "@/components/task/task-result-grid-client"
import { getTaskResults } from "@/app/actions/task/get-task-results"
import { TaskResultTypeType } from "@/lib/types/task/enum.bean"

interface ResultPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

const ITEMS_PER_PAGE = 12; // Define items per page for grid layout

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page as string || "1");
  const currentSearch = params.search as string | undefined;
  const currentType = params.type as TaskResultTypeType | undefined;
  const taskId = params.taskId as string | undefined; // Optional taskId to filter results

  const { data: taskResults, total } = await getTaskResults({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: currentSearch,
    filter: {
      taskId,
      type: currentType,
    },
  });

  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        <TaskResultGridClient
          taskResults={taskResults}
          total={total}
          currentPage={currentPage}
          currentType={currentType}
          currentSearch={currentSearch}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </section>
  )
}