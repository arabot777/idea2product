
import { pgEnum } from "drizzle-orm/pg-core";
import { BillingStatus, Currency, BillingCycle } from "@/lib/types/billing/enum.bean";

export const billingStatusEnum = pgEnum("billing_status", Object.values(BillingStatus) as [string, ...string[]]);
export const currencyEnum = pgEnum("currency", Object.values(Currency) as [string, ...string[]]);
export const billingCycleEnum = pgEnum("billing_cycle", Object.values(BillingCycle) as [string, ...string[]]);

