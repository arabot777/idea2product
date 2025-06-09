import Navbar from "@/components/navbar"
import { TaskHistoryClient } from "@/components/task/task-history-client"
import { getTasks } from "@/app/actions/task/get-tasks"
import { TaskStatusType } from "@/lib/types/task/enum.bean"
import { useTranslations } from 'next-intl';

interface HistoryPageProps {
  searchParams: Promise<{ 
    [key: string]: string | string[] | undefined;
  }>;
}

const ITEMS_PER_PAGE = 10; // Define items per page

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const t = useTranslations('TaskHistoryPage');
  // Ensure searchParams are parsed
  const params = await searchParams;
  const currentPage = parseInt(params.page as string || t('currentPageDefault'));
  const currentSearch = params.search as string | undefined;
  const currentStatus = params.status as TaskStatusType | undefined;

  const { data: tasks, total } = await getTasks({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    search: currentSearch,
    filter: {
      status: currentStatus,
    },
  });

  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        <TaskHistoryClient
          tasks={tasks}
          total={total}
          currentPage={currentPage}
          currentStatus={currentStatus}
          currentSearch={currentSearch}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </section>
  )
}