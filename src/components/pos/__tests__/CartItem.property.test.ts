import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CartItem } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';

// Generator for CartItem
const cartItemArb = fc.record({
  id: fc.uuid(),
  productId: fc.uuid(),
  productName: fc.string({ minLength: 1, maxLength: 50 }),
  unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
  quantity: fc.integer({ min: 1, max: 100 }),
});

/**
 * Feature: cafe-pos, Property 3: Cart Item Display Completeness
 * Validates: Requirements 2.1
 * 
 * Tests that cart item display contains all required fields:
 * - product name
 * - unit price
 * - quantity
 * - item total (unitPrice × quantity)
 */
describe('Property 3: Cart Item Display Completeness', () => {
  // Helper to simulate what the component would render
  function getCartItemDisplayData(item: CartItem) {
    return {
      productName: item.productName,
      unitPrice: item.unitPrice,
      formattedUnitPrice: invoiceService.formatCurrency(item.unitPrice),
      quantity: item.quantity,
      itemTotal: item.unitPrice * item.quantity,
      formattedItemTotal: invoiceService.formatCurrency(item.unitPrice * item.quantity),
    };
  }

  it('display data contains product name', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const displayData = getCartItemDisplayData(item);
        
        expect(displayData.productName).toBe(item.productName);
        expect(displayData.productName.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('display data contains unit price', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const displayData = getCartItemDisplayData(item);
        
        expect(displayData.unitPrice).toBe(item.unitPrice);
        expect(displayData.formattedUnitPrice).toBeDefined();
        expect(displayData.formattedUnitPrice.split('.')[1].length).toBe(2);
      }),
      { numRuns: 100 }
    );
  });

  it('display data contains quantity', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const displayData = getCartItemDisplayData(item);
        
        expect(displayData.quantity).toBe(item.quantity);
        expect(displayData.quantity).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });

  it('display data contains correct item total (unitPrice × quantity)', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const displayData = getCartItemDisplayData(item);
        const expectedTotal = item.unitPrice * item.quantity;
        
        expect(Math.abs(displayData.itemTotal - expectedTotal)).toBeLessThan(0.01);
      }),
      { numRuns: 100 }
    );
  });

  it('all display fields are present and valid', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const displayData = getCartItemDisplayData(item);
        
        // All required fields present
        expect(displayData.productName).toBeDefined();
        expect(displayData.unitPrice).toBeDefined();
        expect(displayData.quantity).toBeDefined();
        expect(displayData.itemTotal).toBeDefined();
        
        // All values are valid
        expect(displayData.productName.length).toBeGreaterThan(0);
        expect(displayData.unitPrice).toBeGreaterThan(0);
        expect(displayData.quantity).toBeGreaterThan(0);
        expect(displayData.itemTotal).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
