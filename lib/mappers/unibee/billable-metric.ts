import { BillableMetricDto } from "../../types/unibee/billable-metric-dto";
import { BillableMetric } from "../../db/schemas/unibee/billable-metric";

export const BillableMetricMapper = {
  toDTO: (model: BillableMetric): BillableMetricDto => {
    return {
      id: model.id,
      unibeeExternalId: model.unibeeExternalId,
      code: model.code,
      metricName: model.metricName,
      metricDescription: model.metricDescription,
      aggregationProperty: model.aggregationProperty,
      aggregationType: model.aggregationType,
      type: model.type,
      featureCalculator: model.featureCalculator,
      featureOnceMax: model.featureOnceMax,
      displayDescription: model.displayDescription,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  fromDTO: (dto: BillableMetricDto): Partial<BillableMetric> => {
    return {
      unibeeExternalId: dto.unibeeExternalId,
      code: dto.code,
      metricName: dto.metricName,
      metricDescription: dto.metricDescription,
      aggregationProperty: dto.aggregationProperty,
      aggregationType: dto.aggregationType,
      type: dto.type,
      featureCalculator: dto.featureCalculator,
      featureOnceMax: dto.featureOnceMax ?? undefined,
      displayDescription: dto.displayDescription,
    };
  },

  toDTOList: (models: BillableMetric[]): BillableMetricDto[] => {
    return models.map(BillableMetricMapper.toDTO);
  },

  fromDTOList: (dtos: BillableMetricDto[]): Partial<BillableMetric>[] => {
    return dtos.map(BillableMetricMapper.fromDTO);
  },
};