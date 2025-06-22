export interface UnibeePlan {
  id: string;
  planName: string;
  description: string;
  amount: number;
  currency: string;
  intervalUnit: string;
  intervalCount: number;
  checkoutUrl: string;
  status: number; // 1-Editing, 2-Active, 3-InActive, 4-SoftArchive, 5-HardArchive
  type: number; // 1-main plan, 2-addon plan, 3-onetime
  createTime: number; // timestamp
  metricLimits: {
    metricLimit: number;
    metricId: number;
  }[];
}

export interface UnibeePlanListResponse {
  code: number;
  data: {
    plans: {
      plan: UnibeePlan;
    }[];
    total: number;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeePaymentTimeline {
  autoCharge: boolean;
  createTime: number;
  currency: string;
  externalTransactionId: string;
  fullRefund: number;
  gatewayId: number;
  id: number;
  invoiceId: string;
  merchantId: number;
  payment: {
    authorizeComment: string;
    authorizeReason: string;
    authorizeStatus: number;
    autoCharge: boolean;
    automatic: number;
    balanceAmount: number;
    billingReason: string;
    cancelTime: number;
    countryCode: string;
    createTime: number;
    currency: string;
    externalPaymentId: string;
    failureReason: string;
    gasPayer: string;
    gatewayCurrencyExchange: {
      exchange_amount: number;
      exchange_rate: number;
      from_currency: string;
      to_currency: string;
    };
    gatewayId: number;
    gatewayPaymentId: string;
    gatewayPaymentType: string;
    invoiceId: string;
    lastError: string;
    link: string;
    merchantId: number;
    metadata: Record<string, any>;
    paidTime: number;
    paymentAmount: number;
    paymentId: string;
    refundAmount: number;
    returnUrl: string;
    status: number; // Unibee payment status
    subscriptionId: string;
    totalAmount: number;
    userId: number;
  };
  paymentId: string;
  refund: {
    countryCode: string;
    createTime: number;
    currency: string;
    externalRefundId: string;
    gatewayCurrencyExchange: {
      exchange_amount: number;
      exchange_rate: number;
      from_currency: string;
      to_currency: string;
    };
    gatewayId: number;
    gatewayRefundId: string;
    invoiceId: string;
    merchantId: number;
    metadata: Record<string, any>;
    paymentId: string;
    refundAmount: number;
    refundComment: string;
    refundCommentExplain: string;
    refundId: string;
    refundTime: number;
    returnUrl: string;
    status: number; // Unibee refund status
    subscriptionId: string;
    type: number;
    userId: number;
  };
  refundId: string;
  status: number; // Unibee timeline status
  subscriptionId: string;
  timelineType: number;
  totalAmount: number;
  transactionId: string;
  userId: number;
}

export interface UnibeePaymentTimelineListResponse {
  code: number;
  data: {
    paymentTimeLines: UnibeePaymentTimeline[];
    total: number;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeUserSubscription {
  addonData: string;
  amount: number;
  billingCycleAnchor: number;
  cancelAtPeriodEnd: number;
  cancelOrExpireTime: number;
  cancelReason: string;
  countryCode: string;
  createTime: number;
  currency: string;
  currentPeriodEnd: number;
  currentPeriodPaid: number;
  currentPeriodStart: number;
  defaultPaymentMethodId: string;
  dunningTime: number;
  externalSubscriptionId: string;
  features: string;
  firstPaidTime: number;
  gasPayer: string;
  gatewayId: number;
  gatewayStatus: string;
  id: number;
  lastUpdateTime: number;
  latestInvoiceId: string;
  link: string;
  merchantId: number;
  metadata: Record<string, any>;
  originalPeriodEnd: number;
  pendingUpdateId: string;
  planId: number;
  productId: number;
  quantity: number;
  returnUrl: string;
  status: number;
  subscriptionId: string;
  taskTime: string;
  taxPercentage: number;
  testClock: number;
  trialEnd: number;
  type: number;
  userId: number;
  vatNumber: string;
}

export interface UnibeeUserSubscriptionResponse {
  code: number;
  data: {
    subscription: UnibeeUserSubscription;
    plan: {
      planName: string;
      description: string;
      amount: number;
      currency: string;
      intervalUnit: string;
      intervalCount: number;
      checkoutUrl: string;
      type: number;
    };
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeClientSessionResponse {
  code: number;
  message: string;
  data: { clientSession: string; userId: string };
}

export interface UnibeeNewMetricRequest {
  aggregationProperty?: string;
  aggregationType: number;//1-count，2-count unique, 3-latest, 4-max, 5-sum
  code: string;
  metricDescription?: string;
  metricName: string;
  type: number; // 1-limit_metered，2-charge_metered,3-charge_recurring
}

export interface UnibeeMerchantMetric {
  aggregationProperty?: string;
  aggregationType: number;
  code: string;
  createTime: number;
  gmtModify: number;
  id: number;
  merchantId: number;
  metricDescription?: string;
  metricName: string;
  type: number;
}

export interface UnibeeNewMetricResponse {
  code: number;
  data: {
    merchantMetric: UnibeeMerchantMetric;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeNewMetricEventRequest {
  aggregationUniqueId?: string;
  aggregationValue?: number;
  externalEventId: string;
  metricCode: string;
  metricProperties?: Record<string, any>;
  userId: number;
}

export interface UnibeeDeleteMetricEventRequest {
  externalEventId: string;
  metricCode: string;
}

export interface UnibeeEventCharge {
  chargeAmount: number;
  chargePricing: {
    chargeType: number;
    graduatedAmounts: {
      endValue: number;
      flatAmount: number;
      perAmount: number;
      startValue: number;
    }[];
    metricId: number;
    standardAmount: number;
    standardStartValue: number;
  };
  currency: string;
  currentValue: number;
  graduatedStep: {
    endValue: number;
    flatAmount: number;
    perAmount: number;
    startValue: number;
  };
  planId: number;
  totalChargeAmount: number;
  unitAmount: number;
}

export interface UnibeeMerchantMetricEvent {
  aggregationPropertyData?: string;
  aggregationPropertyInt?: number;
  aggregationPropertyString?: string;
  chargeInvoiceId?: string;
  createTime: number;
  eventCharge?: UnibeeEventCharge;
  externalEventId: string;
  id: number;
  merchantId: number;
  metricId: number;
  metricLimit: number;
  subscriptionIds?: string;
  subscriptionPeriodEnd: number;
  subscriptionPeriodStart: number;
  used: number;
  userId: number;
}

export interface UnibeeNewMetricEventResponse {
  code: number;
  data: {
    merchantMetricEvent: UnibeeMerchantMetricEvent;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeUserMetricRequest {
  userId?: number;
  externalUserId?: string;
  productId?: number;
}

export interface UnibeeAddonPlan {
  amount: number;
  bindingAddonIds: string;
  bindingOnetimeAddonIds: string;
  cancelAtTrialEnd: number;
  checkoutUrl: string;
  createTime: number;
  currency: string;
  description: string;
  disableAutoCharge: number;
  externalPlanId: string;
  extraMetricData: string;
  gasPayer: string;
  homeUrl: string;
  id: number;
  imageUrl: string;
  internalName: string;
  intervalCount: number;
  intervalUnit: string;
  merchantId: number;
  metadata: Record<string, any>;
  metricLimits: {
    metricId: number;
    metricLimit: number;
  }[];
  metricMeteredCharge: {
    chargeType: number;
    graduatedAmounts: {
      endValue: number;
      flatAmount: number;
      perAmount: number;
      startValue: number;
    }[];
    metricId: number;
    standardAmount: number;
    standardStartValue: number;
  }[];
  metricRecurringCharge: {
    chargeType: number;
    graduatedAmounts: {
      endValue: number;
      flatAmount: number;
      perAmount: number;
      startValue: number;
    }[];
    metricId: number;
    standardAmount: number;
    standardStartValue: number;
  }[];
  planName: string;
  productId: number;
  publishStatus: number;
  status: number;
  taxPercentage: number;
  trialAmount: number;
  trialDemand: string;
  trialDurationTime: number;
  type: number;
}

 
export interface UnibeeMetricLimit {
  MerchantId: number;
  MetricId: number;
  PlanLimits: {
    createTime: number;
    gmtModify: number;
    id: number;
    merchantId: number;
    merchantMetric: UnibeeMerchantMetric;
    metricId: number;
    metricLimit: number;
    planId: number;
  }[];
  TotalLimit: number;
  UserId: number;
  aggregationProperty: string;
  aggregationType: number;
  code: string;
  metricName: string;
  type: number;
}

export interface UnibeeLimitStat {
  CurrentUsedValue: number;
  metricLimit: UnibeeMetricLimit;
}

export interface UnibeeChargePricing {
  chargeType: number;
  graduatedAmounts: {
    endValue: number;
    flatAmount: number;
    perAmount: number;
    startValue: number;
  }[];
  metricId: number;
  standardAmount: number;
  standardStartValue: number;
}

export interface UnibeeGraduatedStep {
  endValue: number;
  flatAmount: number;
  perAmount: number;
  startValue: number;
}

export interface UnibeeMeteredChargeStat {
  CurrentUsedValue: number;
  chargePricing: UnibeeChargePricing;
  graduatedStep: UnibeeGraduatedStep;
  maxEventId: number;
  merchantMetric: UnibeeMerchantMetric;
  metricId: number;
  minEventId: number;
  totalChargeAmount: number;
}

export interface UnibeeRecurringChargeStat {
  CurrentUsedValue: number;
  chargePricing: UnibeeChargePricing;
  graduatedStep: UnibeeGraduatedStep;
  maxEventId: number;
  merchantMetric: UnibeeMerchantMetric;
  metricId: number;
  minEventId: number;
  totalChargeAmount: number;
}

export interface UnibeeUserMetric {
  description: string;
  isPaid: boolean;
  limitStats: UnibeeLimitStat[];
  meteredChargeStats: UnibeeMeteredChargeStat[];
  recurringChargeStats: UnibeeRecurringChargeStat[];
}

export interface UnibeeDeleteMetricEventResponse {
  code: number;
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeUserMetricResponse {
  code: number;
  data: {
    userMetric: UnibeeUserMetric;
  };
  message: string;
  redirect: string;
  requestId: string;
}

export interface UnibeeDeleteMetricRequest {
  metricId: number;
}

export interface UnibeeDeleteMetricResponse {
  code: number;
  data: {
    merchantMetric: UnibeeMerchantMetric;
  };
  message: string;
  redirect: string;
  requestId: string;
}