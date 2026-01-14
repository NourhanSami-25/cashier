import fc from 'fast-check';
import { ProductRepository } from '../../src/repositories/productRepository';
import { CategoryRepository } from '../../src/repositories/categoryRepository';
import { initializeDatabase, resetDatabase, closeDatabase } from '../../src/config/database';

describe('ProductRepository Property Tests', () => {
  let productRepository: ProductRepository;
  let categoryRepository: CategoryRepository;
  let testCategoryId: string;

  beforeAll(() => {
    initializeDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    productRepository = new ProductRepository();
    categoryRepository = new CategoryRepository();
    
    // Create a test category for products
    testCategoryId = categoryRepository.create('Test Category').id;
  });

  afterAll(() => {
    closeDatabase();
  });

  // Feature: cafe-pos-backend, Property 1: Valid product persistence
  test('Property 1: For any product with non-empty name and positive price, creating it should result in retrievable product with identical data', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.float({ min: 0.01, max: 10000, noNaN: true }),
        (name, price) => {
          // Create product
          const created = productRepository.create(name, price, testCategoryId);

          // Retrieve product
          const retrieved = productRepository.findById(created.id);

          // Verify it exists and matches
          expect(retrieved).not.toBeNull();
          expect(retrieved!.id).toBe(created.id);
          expect(retrieved!.name).toBe(name);
          expect(retrieved!.price).toBeCloseTo(price, 2);
          expect(retrieved!.categoryId).toBe(testCategoryId);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: cafe-pos-backend, Property 4: Product update persistence
  test('Property 4: For any existing product and valid update data, updating should result in updated data being retrievable', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.float({ min: 0.01, max: 10000, noNaN: true }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.float({ min: 0.01, max: 10000, noNaN: true }),
        (originalName, originalPrice, newName, newPrice) => {
          // Create product
          const created = productRepository.create(originalName, originalPrice, testCategoryId);

          // Update product
          const updated = productRepository.update(created.id, newName, newPrice, testCategoryId);

          // Verify update succeeded
          expect(updated).not.toBeNull();
          expect(updated!.name).toBe(newName);
          expect(updated!.price).toBeCloseTo(newPrice, 2);

          // Retrieve and verify
          const retrieved = productRepository.findById(created.id);
          expect(retrieved).not.toBeNull();
          expect(retrieved!.name).toBe(newName);
          expect(retrieved!.price).toBeCloseTo(newPrice, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: cafe-pos-backend, Property 5: Product deletion completeness
  test('Property 5: For any existing product, deleting it should result in it no longer being retrievable', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.float({ min: 0.01, max: 10000, noNaN: true }),
        (name, price) => {
          // Create product
          const created = productRepository.create(name, price, testCategoryId);

          // Verify it exists
          expect(productRepository.findById(created.id)).not.toBeNull();

          // Delete product
          const deleted = productRepository.delete(created.id);
          expect(deleted).toBe(true);

          // Verify it no longer exists
          const retrieved = productRepository.findById(created.id);
          expect(retrieved).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: cafe-pos-backend, Property 6: Product retrieval completeness
  test('Property 6: For any set of products, retrieving all should return exactly that set', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            price: fc.float({ min: 0.01, max: 10000, noNaN: true })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (products) => {
          // Create all products
          const createdIds = products.map(p => 
            productRepository.create(p.name, p.price, testCategoryId).id
          );

          // Retrieve all products
          const allProducts = productRepository.findAll();

          // Verify count matches
          expect(allProducts.length).toBe(createdIds.length);

          // Verify all created products are in the result
          createdIds.forEach(id => {
            const found = allProducts.find(prod => prod.id === id);
            expect(found).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
