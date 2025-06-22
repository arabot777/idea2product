import Navbar from "@/components/navbar";
import { TaskHistoryClient } from "@/components/task/task-history-client";
import { Suspense } from "react";

interface HistoryPageProps {}

// Loading component for Suspense fallback
function TaskHistoryLoading() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <span className="ml-4 text-gray-400">Loading...</span>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        <Suspense fallback={<TaskHistoryLoading />}>
          <TaskHistoryClient />
        </Suspense>
      </div>
    </section>
  );
}
