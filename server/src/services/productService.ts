import { ProductRepository } from '../repositories/productRepository';
import { Product } from '../models';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Validate product data
   * Throws ValidationError if invalid
   */
  validateProduct(name: string, price: number): void {
    // Check if name is empty or whitespace only
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Product name cannot be empty', 'name');
    }

    // Check if price is positive
    if (price <= 0) {
      throw new ValidationError('Product price must be greater than 0', 'price');
    }
  }

  /**
   * Create a new product
   */
  createProduct(name: string, price: number, categoryId: string): Product {
    this.validateProduct(name, price);
    return this.productRepository.create(name, price, categoryId);
  }

  /**
   * Get all products
   */
  getAllProducts(): Product[] {
    return this.productRepository.findAll();
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Product | null {
    return this.productRepository.findById(id);
  }

  /**
   * Update product
   */
  updateProduct(id: string, name: string, price: number, categoryId: string): Product {
    this.validateProduct(name, price);
    
    const updated = this.productRepository.update(id, name, price, categoryId);
    if (!updated) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }
    
    return updated;
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): boolean {
    const deleted = this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }
    return true;
  }
}
