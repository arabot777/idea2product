import { db } from "@/lib/db/drizzle";
import { stripeProducts, NewStripeProduct, StripeProduct } from "@/lib/db/schemas/billing/stripe-product";
import { eq } from "drizzle-orm";

export class StripeProductEdit {
  /**
   * Creates a new Stripe product.
   * @param data Product data.
   * @returns The created product.
   */
  static async create(data: NewStripeProduct): Promise<StripeProduct> {
    const [newStripeProduct] = await db.insert(stripeProducts).values(data).returning();
    return newStripeProduct;
  }

  /**
   * Updates a Stripe product.
   * @param id Product ID.
   * @param data Fields to update.
   * @returns The updated product, or null if not found.
   */
  static async update(id: string, data: Partial<NewStripeProduct>): Promise<StripeProduct | null> {
    const [updatedStripeProduct] = await db
      .update(stripeProducts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(stripeProducts.id, id))
      .returning();
    return updatedStripeProduct || null;
  }

  /**
   * Deletes a Stripe product.
   * @param id Product ID.
   * @returns The deleted product, or null if not found.
   */
  static async delete(id: string): Promise<StripeProduct | null> {
    const [deletedStripeProduct] = await db
      .delete(stripeProducts)
      .where(eq(stripeProducts.id, id))
      .returning();
    return deletedStripeProduct || null;
  }
}
