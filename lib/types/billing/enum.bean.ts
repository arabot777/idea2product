export const Currency = {
  USD: "usd",
  CNY: "cny",
} as const;

export type CurrencyType = (typeof Currency)[keyof typeof Currency];

export const BillingCycle = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
} as const;

export type BillingCycleType = (typeof BillingCycle)[keyof typeof BillingCycle];

export const BillingStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
  PAST_DUE: "past_due",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  TRIALING: "trialing",
} as const;

export type BillingStatusType = (typeof BillingStatus)[keyof typeof BillingStatus];
