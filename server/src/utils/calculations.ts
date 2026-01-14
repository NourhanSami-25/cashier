import { InvoiceItem } from '../models';

/**
 * Calculate line total for a single item
 */
export function calculateLineTotal(price: number, quantity: number): number {
  return price * quantity;
}

/**
 * Calculate subtotal from all invoice items
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

/**
 * Calculate service charge as percentage of subtotal
 */
export function calculateServiceCharge(subtotal: number, serviceRate: number): number {
  return subtotal * serviceRate;
}

/**
 * Calculate tax as percentage of (subtotal + service charge)
 */
export function calculateTax(subtotal: number, serviceCharge: number, taxRate: number): number {
  const taxableAmount = subtotal + serviceCharge;
  return taxableAmount * taxRate;
}

/**
 * Calculate final total
 */
export function calculateTotal(subtotal: number, serviceCharge: number, tax: number): number {
  return subtotal + serviceCharge + tax;
}
