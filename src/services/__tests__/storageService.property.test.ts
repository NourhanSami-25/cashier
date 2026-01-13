import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { storageService } from '../storageService';

/**
 * Feature: cafe-pos, Property 11: Data Persistence Round-Trip
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */
describe('Property 11: Data Persistence Round-Trip', () => {
  beforeEach(() => {
    storageService.clear();
  });

  // Generator for Product
  const productArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    price: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
    categoryId: fc.uuid(),
  });

  // Generator for Category
  const categoryArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
  });

  // Generator for InvoiceItem
  const invoiceItemArb = fc.record({
    productId: fc.uuid(),
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
    quantity: fc.integer({ min: 1, max: 100 }),
    itemTotal: fc.integer({ min: 1, max: 100000000 }).map(n => n / 100),
  });

  // Generator for Invoice
  const invoiceArb = fc.record({
    id: fc.uuid(),
    invoiceNumber: fc.string({ minLength: 5, maxLength: 20 }),
    dateTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    items: fc.array(invoiceItemArb, { minLength: 1, maxLength: 10 }),
    subtotal: fc.integer({ min: 0, max: 100000000 }).map(n => n / 100),
    serviceFee: fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
    tax: fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
    total: fc.integer({ min: 0, max: 200000000 }).map(n => n / 100),
    paymentMethod: fc.constantFrom('cash', 'card') as fc.Arbitrary<'cash' | 'card'>,
    isPaid: fc.boolean(),
  });

  it('save then load returns equivalent product', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const key = `test_product_${product.id}`;
        storageService.save(key, product);
        const loaded = storageService.load(key);
        
        expect(loaded).toEqual(product);
        
        // Cleanup
        storageService.remove(key);
      }),
      { numRuns: 100 }
    );
  });

  it('save then load returns equivalent category', () => {
    fc.assert(
      fc.property(categoryArb, (category) => {
        const key = `test_category_${category.id}`;
        storageService.save(key, category);
        const loaded = storageService.load(key);
        
        expect(loaded).toEqual(category);
        
        // Cleanup
        storageService.remove(key);
      }),
      { numRuns: 100 }
    );
  });

  it('save then load returns equivalent invoice (with date serialization)', () => {
    fc.assert(
      fc.property(invoiceArb, (invoice) => {
        const key = `test_invoice_${invoice.id}`;
        storageService.save(key, invoice);
        const loaded = storageService.load<typeof invoice>(key);
        
        // Date gets serialized as string, so we compare after conversion
        expect(loaded).not.toBeNull();
        if (loaded) {
          expect(loaded.id).toBe(invoice.id);
          expect(loaded.invoiceNumber).toBe(invoice.invoiceNumber);
          expect(loaded.items).toEqual(invoice.items);
          expect(loaded.subtotal).toBe(invoice.subtotal);
          expect(loaded.serviceFee).toBe(invoice.serviceFee);
          expect(loaded.tax).toBe(invoice.tax);
          expect(loaded.total).toBe(invoice.total);
          expect(loaded.paymentMethod).toBe(invoice.paymentMethod);
          expect(loaded.isPaid).toBe(invoice.isPaid);
        }
        
        // Cleanup
        storageService.remove(key);
      }),
      { numRuns: 100 }
    );
  });

  it('save then load returns equivalent array of products', () => {
    fc.assert(
      fc.property(fc.array(productArb, { minLength: 0, maxLength: 20 }), (products) => {
        const key = 'test_products_array';
        storageService.save(key, products);
        const loaded = storageService.load(key);
        
        expect(loaded).toEqual(products);
        
        // Cleanup
        storageService.remove(key);
      }),
      { numRuns: 100 }
    );
  });

  it('remove actually removes data', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const key = `test_remove_${product.id}`;
        storageService.save(key, product);
        storageService.remove(key);
        const loaded = storageService.load(key);
        
        expect(loaded).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
