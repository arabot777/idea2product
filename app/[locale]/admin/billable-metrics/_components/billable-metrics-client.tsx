'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AggregationType, BillableMetricDto, MetricType, aggregationTypeLabels, metricTypeLabels } from '@/lib/types/unibee/billable-metric-dto';
import { BillableMetricForm } from './billable-metric-form';
import { deleteBillableMetric } from '@/app/actions/unibee/delete-billable-metric';
import { listBillableMetrics } from '@/app/actions/unibee/list-billable-metrics';
import { toast } from 'sonner';

interface BillableMetricsClientProps {
  // data: BillableMetricDto[];
}

export function BillableMetricsClient({}: BillableMetricsClientProps) {
  const [metrics, setMetrics] = useState<BillableMetricDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<BillableMetricDto | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<BillableMetricDto | null>(null);

  const fetchMetrics = async () => {
    const data = await listBillableMetrics();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const openFormModal = (metric: BillableMetricDto | null) => {
    setSelectedMetric(metric);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setSelectedMetric(null);
    setIsFormOpen(false);
  };

  const openConfirmModal = (metric: BillableMetricDto) => {
    setMetricToDelete(metric);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setMetricToDelete(null);
    setIsConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!metricToDelete || !metricToDelete.unibeeExternalId) return;

    const result = await deleteBillableMetric(metricToDelete.id);

    if (result.success) {
      setMetrics(metrics.filter((m) => m.id !== metricToDelete.id));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    closeConfirmModal();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openFormModal(null)}>New Metric</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMetric ? 'Edit' : 'New'} Billable Metric</DialogTitle>
            </DialogHeader>
            <BillableMetricForm
              metric={selectedMetric}
              onSuccess={() => {
                closeFormModal();
                fetchMetrics(); // Refresh data
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Aggregation</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell>{metric.metricName}</TableCell>
              <TableCell>{metric.code}</TableCell>
              <TableCell>
                {metricTypeLabels[metric.type as MetricType] || metric.type}
              </TableCell>
              <TableCell>
                {aggregationTypeLabels[metric.aggregationType as AggregationType] || metric.aggregationType}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => openFormModal(metric)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openConfirmModal(metric)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the billable metric.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmModal}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}