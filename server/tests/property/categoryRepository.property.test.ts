import fc from 'fast-check';
import { CategoryRepository } from '../../src/repositories/categoryRepository';
import { initializeDatabase, resetDatabase, closeDatabase } from '../../src/config/database';

describe('CategoryRepository Property Tests', () => {
  let categoryRepository: CategoryRepository;

  beforeAll(() => {
    initializeDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    categoryRepository = new CategoryRepository();
  });

  afterAll(() => {
    closeDatabase();
  });

  // Feature: cafe-pos-backend, Property 7: Category persistence and retrieval
  test('Property 7: For any valid category, creating it should result in it being retrievable', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (name) => {
          // Create category
          const created = categoryRepository.create(name);

          // Retrieve category
          const retrieved = categoryRepository.findById(created.id);

          // Verify it exists and matches
          expect(retrieved).not.toBeNull();
          expect(retrieved!.id).toBe(created.id);
          expect(retrieved!.name).toBe(name);
          expect(retrieved!.createdAt).toEqual(created.createdAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: cafe-pos-backend, Property 8: Category list completeness
  test('Property 8: For any set of categories, retrieving all should return exactly that set', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
        (names) => {
          // Create all categories
          const createdIds = names.map(name => categoryRepository.create(name).id);

          // Retrieve all categories
          const allCategories = categoryRepository.findAll();

          // Verify count matches
          expect(allCategories.length).toBe(createdIds.length);

          // Verify all created categories are in the result
          createdIds.forEach(id => {
            const found = allCategories.find(cat => cat.id === id);
            expect(found).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
