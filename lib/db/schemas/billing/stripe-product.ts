import { pgTable, text, jsonb, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";

export const stripeProducts = pgTable("stripe_products", {
  // Primary key, using Stripe product ID
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  // Source ID, currently from Subscription Plans and Premium Packages
  sourceId: text("source_id").notNull(),
  // Source type: Subscription Plan, Premium Package
  sourceType: text("source_type").notNull(),
  // Records the Stripe account ID + test mode, as product information for these two is completely independent
  stripeAccountId: text("stripe_account_id").notNull(),
  // Stripe Product ID
  productId: text("product_id").notNull(),
  // Product Name
  productName: text("product_name").notNull(),
  // Product Description, optional
  productDescription: text("product_description"),
  // Stripe Price ID
  priceId: text("price_id").notNull(),
  // Price amount in cents, must be greater than 50
  priceUnitAmount: integer("price_unit_amount").notNull(),
  // Price currency, optional: usd, cny
  priceCurrency: text("price_currency").notNull(),
  // Price interval, optional: month, year
  priceInterval: text("price_interval"),
  // Creation time
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Update time
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type export
export type StripeProduct = typeof stripeProducts.$inferSelect;
export type NewStripeProduct = typeof stripeProducts.$inferInsert;
