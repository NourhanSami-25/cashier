import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { invoiceService } from '../invoiceService';
import { CartItem } from '@/types/pos';
import { POS_CONFIG } from '@/config/pos.config';

/**
 * Feature: cafe-pos, Property 5: Invoice Calculation Correctness
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
describe('Property 5: Invoice Calculation Correctness', () => {
  // Generator for valid cart items
  const cartItemArb = fc.record({
    id: fc.uuid(),
    productId: fc.uuid(),
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100), // 0.01 to 10000
    quantity: fc.integer({ min: 1, max: 100 }),
  });

  const cartItemsArb = fc.array(cartItemArb, { minLength: 0, maxLength: 20 });

  it('subtotal equals sum of (unitPrice × quantity) for all items', () => {
    fc.assert(
      fc.property(cartItemsArb, (items: CartItem[]) => {
        const expectedSubtotal = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        const actualSubtotal = invoiceService.calculateSubtotal(items);
        
        // Use approximate equality due to floating point
        expect(Math.abs(actualSubtotal - expectedSubtotal)).toBeLessThan(0.001);
      }),
      { numRuns: 100 }
    );
  });

  it('serviceFee equals subtotal × serviceFeePercentage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
        (subtotal: number) => {
          const expectedServiceFee = subtotal * POS_CONFIG.serviceFeePercentage;
          const actualServiceFee = invoiceService.calculateServiceFee(subtotal);
          
          expect(Math.abs(actualServiceFee - expectedServiceFee)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tax equals subtotal × taxPercentage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
        (subtotal: number) => {
          const expectedTax = subtotal * POS_CONFIG.taxPercentage;
          const actualTax = invoiceService.calculateTax(subtotal);
          
          expect(Math.abs(actualTax - expectedTax)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('total equals subtotal + serviceFee + tax', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
        fc.integer({ min: 0, max: 1000000 }).map(n => n / 100),
        fc.integer({ min: 0, max: 1000000 }).map(n => n / 100),
        (subtotal: number, serviceFee: number, tax: number) => {
          const expectedTotal = subtotal + serviceFee + tax;
          const actualTotal = invoiceService.calculateTotal(subtotal, serviceFee, tax);
          
          expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('full calculation chain is consistent', () => {
    fc.assert(
      fc.property(cartItemsArb, (items: CartItem[]) => {
        const subtotal = invoiceService.calculateSubtotal(items);
        const serviceFee = invoiceService.calculateServiceFee(subtotal);
        const tax = invoiceService.calculateTax(subtotal);
        const total = invoiceService.calculateTotal(subtotal, serviceFee, tax);

        // Verify the chain
        const expectedTotal = subtotal + serviceFee + tax;
        expect(Math.abs(total - expectedTotal)).toBeLessThan(0.001);

        // Verify non-negative values
        expect(subtotal).toBeGreaterThanOrEqual(0);
        expect(serviceFee).toBeGreaterThanOrEqual(0);
        expect(tax).toBeGreaterThanOrEqual(0);
        expect(total).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cafe-pos, Property 6: Monetary Value Formatting
 * Validates: Requirements 3.6
 */
describe('Property 6: Monetary Value Formatting', () => {
  it('formatted currency has exactly 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }).map(n => n / 100),
        (amount: number) => {
          const formatted = invoiceService.formatCurrency(amount);
          
          // Check format: should have exactly 2 decimal places
          const parts = formatted.split('.');
          expect(parts.length).toBe(2);
          expect(parts[1].length).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('formatted currency is parseable back to number', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }).map(n => n / 100),
        (amount: number) => {
          const formatted = invoiceService.formatCurrency(amount);
          const parsed = parseFloat(formatted);
          
          // Should be approximately equal (within 2 decimal precision)
          expect(Math.abs(parsed - amount)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
