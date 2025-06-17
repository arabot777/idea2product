import Navbar from "@/components/navbar";
import { TaskResultGridClient } from "@/components/task/task-result-grid-client";
import { Suspense } from "react";

interface ResultPageProps {}

// Loading component for Suspense fallback
function TaskResultsLoading() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <span className="ml-4 text-gray-400">Loading...</span>
    </div>
  );
}

export default function ResultPage() {
  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-15">
        <Suspense fallback={<TaskResultsLoading />}>
          <TaskResultGridClient />
        </Suspense>
      </div>
    </section>
  );
}
