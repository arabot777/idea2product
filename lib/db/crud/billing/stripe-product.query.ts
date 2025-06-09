import { db } from "@/lib/db/drizzle";
import { stripeProducts, StripeProduct } from "@/lib/db/schemas/billing/stripe-product";
import { eq, and } from "drizzle-orm";

export class StripeProductQuery {
  /**
   * Retrieves a Stripe product by ID.
   * @param id Product ID.
   * @returns Product information, or null if not found.
   */
  static async getById(id: string): Promise<StripeProduct | null> {
    const [stripeProduct] = await db.select().from(stripeProducts).where(eq(stripeProducts.id, id)).limit(1);
    return stripeProduct || null;
  }

  /**
   * Retrieves all Stripe products.
   * @returns A list of all products.
   */
  static async getAll(): Promise<StripeProduct[]> {
    const allStripeProducts = await db.select().from(stripeProducts);
    return allStripeProducts;
  }

  /**
   * Retrieves a Stripe product by source ID and type.
   * @param sourceId Source ID.
   * @param sourceType Source type.
   * @returns Product information, or null if not found.
   */
  static async getBySource(
    sourceId: string,
    sourceType: string,
    accountId: string,
    currency?: string,
    priceUnitAmount?: number,
    productName?: string,
    productDescription?: string
  ): Promise<StripeProduct | null> {
    const conditions = [eq(stripeProducts.sourceId, sourceId), eq(stripeProducts.sourceType, sourceType),eq(stripeProducts.stripeAccountId, accountId)];

    if (currency !== undefined) {
      conditions.push(eq(stripeProducts.priceCurrency, currency));
    }

    if (priceUnitAmount !== undefined) {
      conditions.push(eq(stripeProducts.priceUnitAmount, priceUnitAmount));
    }

    if (productName !== undefined) {
      conditions.push(eq(stripeProducts.productName, productName));
    }

    if (productDescription !== undefined) {
      conditions.push(eq(stripeProducts.productDescription, productDescription));
    }

    const [stripeProduct] = await db
      .select()
      .from(stripeProducts)
      .where(and(...conditions))
      .limit(1);
    return stripeProduct || null;
  }

  /**
   * Retrieves a product by Stripe product ID.
   * @param productId Stripe product ID.
   * @returns Product information, or null if not found.
   */
  static async getByProductId(productId: string): Promise<StripeProduct | null> {
    const [stripeProduct] = await db.select().from(stripeProducts).where(eq(stripeProducts.productId, productId)).limit(1);
    return stripeProduct || null;
  }

  /**
   * Retrieves a product by Stripe price ID.
   * @param priceId Stripe price ID.
   * @returns Product information, or null if not found.
   */
  static async getByPriceId(priceId: string): Promise<StripeProduct | null> {
    const [stripeProduct] = await db.select().from(stripeProducts).where(eq(stripeProducts.priceId, priceId)).limit(1);
    return stripeProduct || null;
  }

  /**
   * Retrieves all products by account ID.
   * @param stripeAccountId Stripe account ID.
   * @returns A list of products.
   */
  static async getByAccountId(stripeAccountId: string): Promise<StripeProduct[]> {
    const stripeProductsList = await db.select().from(stripeProducts).where(eq(stripeProducts.stripeAccountId, stripeAccountId));
    return stripeProductsList;
  }
}
