import { z } from 'zod';

export enum AggregationType {
  Count = 1,
  CountUnique = 2,
  Latest = 3,
  Max = 4,
  Sum = 5,
}

export const aggregationTypeLabels: Record<AggregationType, string> = {
  [AggregationType.Count]: 'Count',
  [AggregationType.CountUnique]: 'Count Unique',
  [AggregationType.Latest]: 'Latest',
  [AggregationType.Max]: 'Max',
  [AggregationType.Sum]: 'Sum',
};

export enum MetricType {
  LimitMetered = 1,
  ChargeMetered = 2,
  ChargeRecurring = 3,
}

export const metricTypeLabels: Record<MetricType, string> = {
  [MetricType.LimitMetered]: 'Limit Metered',
  [MetricType.ChargeMetered]: 'Charge Metered',
  [MetricType.ChargeRecurring]: 'Charge Recurring',
};

export const BillableMetricSchema = z.object({
  id: z.string().uuid(),
  unibeeExternalId: z.string().nullable(),
  code: z.string(),
  metricName: z.string(),
  metricDescription: z.string().nullable(),
  aggregationProperty: z.string().nullable(),
  aggregationType: z.nativeEnum(AggregationType),
  type: z.nativeEnum(MetricType),
  featureCalculator: z.string(),
  displayDescription: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BillableMetricDto = z.infer<typeof BillableMetricSchema>;