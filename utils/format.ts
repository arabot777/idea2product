/**
 * Formats a date into a "YYYY-MM-DD" string.
 * @param date The Date object
 * @returns The formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Capitalizes the first letter of a given string.
 * @param text The input string
 * @returns The string with the first letter capitalized
 */
export function capitalize(text: string): string {
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Calculates the price after discount.
 * @param price The original price
 * @param discount The discount rate (e.g., 0.10 for 10% discount)
 * @returns The discounted price
 */
export function calculateDiscountedPrice(price: number, discount: number): number {
  if (price < 0 || discount < 0 || discount > 1) {
    throw new Error("Invalid price or discount. Price must be non-negative, and discount must be between 0 and 1.");
  }
  return price * (1 - discount);
}