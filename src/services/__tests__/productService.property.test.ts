import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { productService } from '../productService';
import { storageService } from '../storageService';
import { STORAGE_KEYS } from '@/config/pos.config';
import { Product, Category } from '@/types/pos';

/**
 * Feature: cafe-pos, Property 1: Category Filtering Correctness
 * Validates: Requirements 1.2
 */
describe('Property 1: Category Filtering Correctness', () => {
  beforeEach(() => {
    storageService.clear();
  });

  // Generator for Category
  const categoryArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
  });

  // Generator for Product with specific categoryId
  const productWithCategoryArb = (categoryIds: string[]) =>
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      price: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
      categoryId: fc.constantFrom(...categoryIds),
    });

  it('filtered products only contain products from selected category', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArb, { minLength: 2, maxLength: 5 }),
        (categories: Category[]) => {
          // Setup categories
          storageService.save(STORAGE_KEYS.CATEGORIES, categories);

          // Generate products with random categories
          const categoryIds = categories.map(c => c.id);
          const productsArb = fc.array(productWithCategoryArb(categoryIds), {
            minLength: 5,
            maxLength: 20,
          });

          return fc.assert(
            fc.property(productsArb, (products: Product[]) => {
              // Setup products
              storageService.save(STORAGE_KEYS.PRODUCTS, products);

              // Pick a random category to filter
              const targetCategoryId = categoryIds[0];
              const filtered = productService.getProductsByCategory(targetCategoryId);

              // All filtered products should have the target categoryId
              filtered.forEach(product => {
                expect(product.categoryId).toBe(targetCategoryId);
              });

              // Filtered should be subset of original
              expect(filtered.length).toBeLessThanOrEqual(products.length);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 5 }
    );
  });

  it('filtering returns all products with matching category', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArb, { minLength: 2, maxLength: 5 }),
        (categories: Category[]) => {
          storageService.save(STORAGE_KEYS.CATEGORIES, categories);

          const categoryIds = categories.map(c => c.id);
          const productsArb = fc.array(productWithCategoryArb(categoryIds), {
            minLength: 5,
            maxLength: 20,
          });

          return fc.assert(
            fc.property(productsArb, (products: Product[]) => {
              storageService.save(STORAGE_KEYS.PRODUCTS, products);

              const targetCategoryId = categoryIds[0];
              const filtered = productService.getProductsByCategory(targetCategoryId);

              // Count expected matches
              const expectedCount = products.filter(
                p => p.categoryId === targetCategoryId
              ).length;

              expect(filtered.length).toBe(expectedCount);
            }),
            { numRuns: 20 }
          );
        }
      ),
      { numRuns: 5 }
    );
  });
});

/**
 * Feature: cafe-pos, Property 9: Product Validation
 * Validates: Requirements 6.4
 */
describe('Property 9: Product Validation', () => {
  beforeEach(() => {
    storageService.clear();
    // Setup a valid category for testing
    storageService.save(STORAGE_KEYS.CATEGORIES, [{ id: 'valid-cat', name: 'Valid' }]);
  });

  it('empty name fails validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n'),
        fc.integer({ min: 1, max: 10000 }).map(n => n / 100),
        (name: string, price: number) => {
          const result = productService.validateProduct({
            name,
            price,
            categoryId: 'valid-cat',
          });

          expect(result.isValid).toBe(false);
          expect(result.errors.name).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('negative or zero price fails validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: -10000, max: 0 }).map(n => n / 100),
        (name: string, price: number) => {
          const result = productService.validateProduct({
            name,
            price,
            categoryId: 'valid-cat',
          });

          expect(result.isValid).toBe(false);
          expect(result.errors.price).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty categoryId fails validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10000 }).map(n => n / 100),
        fc.constantFrom('', '   '),
        (name: string, price: number, categoryId: string) => {
          const result = productService.validateProduct({
            name,
            price,
            categoryId,
          });

          expect(result.isValid).toBe(false);
          expect(result.errors.categoryId).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid product passes validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
        (name: string, price: number) => {
          const result = productService.validateProduct({
            name,
            price,
            categoryId: 'valid-cat',
          });

          expect(result.isValid).toBe(true);
          expect(Object.keys(result.errors).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
