/**
 * Property-Based Tests for ProductService
 * Feature: cafe-pos-backend, Property 2: Product Validation
 * Validates: Requirements 3.5, 3.6
 */

import * as fc from 'fast-check';
import { ProductService } from '../productService';
import { initializeDatabase, getDatabase } from '../../config/database';
import { categoryRepository } from '../../repositories/categoryRepository';

describe('ProductService Property Tests', () => {
  let productService: ProductService;
  let testCategoryId: string;

  beforeAll(() => {
    initializeDatabase();
    productService = new ProductService();
    // Create a test category
    const category = categoryRepository.create('Test Category');
    testCategoryId = category.id;
  });

  afterAll(() => {
    const db = getDatabase();
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
  });

  /**
   * Property 2: Product Validation
   * For any product submission:
   * - If name is empty or whitespace-only, validation SHALL fail
   * - If price is zero or negative, validation SHALL fail
   * - If all fields are valid, validation SHALL pass
   */
  describe('Property 2: Product Validation', () => {
    // Test: Empty or whitespace-only names should fail validation
    it('should fail validation for empty or whitespace-only names', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.stringOf(fc.constant(' ')).filter(s => s.length > 0 && s.trim() === '')
          ),
          (invalidName) => {
            const result = productService.validateProduct({
              name: invalidName,
              price: 10,
              categoryId: testCategoryId
            });
            return !result.isValid && 'name' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Test: Zero or negative prices should fail validation
    it('should fail validation for zero or negative prices', () => {
      fc.assert(
        fc.property(
          fc.double({ max: 0, noNaN: true }),
          (invalidPrice) => {
            const result = productService.validateProduct({
              name: 'Valid Product',
              price: invalidPrice,
              categoryId: testCategoryId
            });
            return !result.isValid && 'price' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Test: Valid products should pass validation
    it('should pass validation for valid products', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.double({ min: 0.01, max: 100000, noNaN: true }),
          (validName, validPrice) => {
            const result = productService.validateProduct({
              name: validName,
              price: validPrice,
              categoryId: testCategoryId
            });
            return result.isValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Test: Undefined price should fail validation
    it('should fail validation when price is undefined', () => {
      const result = productService.validateProduct({
        name: 'Valid Product',
        price: undefined,
        categoryId: testCategoryId
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.price).toBeDefined();
    });
  });
});
