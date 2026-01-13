import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { CartItem, PaymentMethod } from '@/types/pos';
import { invoiceService } from '../invoiceService';
import { storageService } from '../storageService';
import { STORAGE_KEYS } from '@/config/pos.config';

// Generators
const cartItemArb = fc.record({
  id: fc.uuid(),
  productId: fc.uuid(),
  productName: fc.string({ minLength: 1, maxLength: 50 }),
  unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
  quantity: fc.integer({ min: 1, max: 100 }),
});

const paymentMethodArb = fc.constantFrom('cash', 'card') as fc.Arbitrary<PaymentMethod>;

/**
 * Feature: cafe-pos, Property 7: Sale Completion Invariants
 * Validates: Requirements 4.2, 4.3, 4.4
 */
describe('Property 7: Sale Completion Invariants', () => {
  beforeEach(() => {
    storageService.clear();
  });

  it('completed invoice has isPaid = true', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          
          expect(invoice.isPaid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoice is persisted to storage after save', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          invoiceService.saveInvoice(invoice);
          
          const savedInvoices = storageService.load<typeof invoice[]>(STORAGE_KEYS.INVOICES);
          
          expect(savedInvoices).not.toBeNull();
          expect(savedInvoices!.some(inv => inv.id === invoice.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoice contains all items from cart', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          
          expect(invoice.items.length).toBe(items.length);
          
          items.forEach(cartItem => {
            const invoiceItem = invoice.items.find(
              i => i.productId === cartItem.productId
            );
            expect(invoiceItem).toBeDefined();
            expect(invoiceItem!.productName).toBe(cartItem.productName);
            expect(invoiceItem!.unitPrice).toBe(cartItem.unitPrice);
            expect(invoiceItem!.quantity).toBe(cartItem.quantity);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoice has correct payment method', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          
          expect(invoice.paymentMethod).toBe(paymentMethod);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoice totals match calculated values', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          
          const expectedSubtotal = invoiceService.calculateSubtotal(items);
          const expectedServiceFee = invoiceService.calculateServiceFee(expectedSubtotal);
          const expectedTax = invoiceService.calculateTax(expectedSubtotal);
          const expectedTotal = invoiceService.calculateTotal(
            expectedSubtotal,
            expectedServiceFee,
            expectedTax
          );

          expect(Math.abs(invoice.subtotal - expectedSubtotal)).toBeLessThan(0.01);
          expect(Math.abs(invoice.serviceFee - expectedServiceFee)).toBeLessThan(0.01);
          expect(Math.abs(invoice.tax - expectedTax)).toBeLessThan(0.01);
          expect(Math.abs(invoice.total - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoice has valid invoice number', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        paymentMethodArb,
        (items: CartItem[], paymentMethod: PaymentMethod) => {
          const invoice = invoiceService.createInvoice(items, paymentMethod);
          
          expect(invoice.invoiceNumber).toBeDefined();
          expect(invoice.invoiceNumber.startsWith('INV-')).toBe(true);
          expect(invoice.invoiceNumber.length).toBeGreaterThan(10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
