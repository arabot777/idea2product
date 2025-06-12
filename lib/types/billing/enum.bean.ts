export const Currency = {
  USD: "usd",
  CNY: "cny",
  EUR: "eur",
} as const;

export type CurrencyType = (typeof Currency)[keyof typeof Currency];

export const BillingCycle = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
} as const;

export type BillingCycleType = (typeof BillingCycle)[keyof typeof BillingCycle];

export const BillingStatus = {
  PENDING: "pending",           // Pending
  ACTIVE: "active",             // Active
  PENDING_INACTIVE: "pending_inactive", // Pending inactive
  CANCELED: "canceled",         // Canceled
  EXPIRED: "expired",           // Expired
  PAUSED: "paused",             // Paused
  INCOMPLETE: "incomplete",     // Incomplete
  PROCESSING: "processing",     // Processing
  FAILED: "failed",             // Failed
} as const;

export type BillingStatusType = (typeof BillingStatus)[keyof typeof BillingStatus];
