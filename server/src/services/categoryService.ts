import { CategoryRepository } from '../repositories/categoryRepository';
import { Category } from '../models';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Create a new category
   */
  createCategory(name: string): Category {
    return this.categoryRepository.create(name);
  }

  /**
   * Get all categories
   */
  getAllCategories(): Category[] {
    return this.categoryRepository.findAll();
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Category | null {
    return this.categoryRepository.findById(id);
  }

  /**
   * Delete category
   */
  deleteCategory(id: string): boolean {
    const deleted = this.categoryRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    return true;
  }
}
