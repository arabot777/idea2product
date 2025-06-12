import { BillableMetricsClient } from './_components/billable-metrics-client';
import { PageHeader } from '@/components/admin/page-header';

export default function BillableMetricsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Billable Metrics"
        description="Manage your billable metrics here."
      />
      <BillableMetricsClient />
    </div>
  );
}