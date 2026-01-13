import { Product, Category, ValidationResult } from '@/types/pos';
import { STORAGE_KEYS } from '@/config/pos.config';
import { storageService } from './storageService';

class ProductService {
  /**
   * Get all products from storage
   */
  getAllProducts(): Product[] {
    return storageService.load<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  }

  /**
   * Get products filtered by category
   */
  getProductsByCategory(categoryId: string): Product[] {
    const products = this.getAllProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  /**
   * Add a new product
   */
  addProduct(productData: Omit<Product, 'id'>): Product {
    const validation = this.validateProduct(productData);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const product: Product = {
      ...productData,
      id: crypto.randomUUID(),
    };

    const products = this.getAllProducts();
    products.push(product);
    storageService.save(STORAGE_KEYS.PRODUCTS, products);

    return product;
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, productData: Partial<Product>): Product {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('المنتج غير موجود');
    }

    const updatedProduct = { ...products[index], ...productData };
    const validation = this.validateProduct(updatedProduct);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    products[index] = updatedProduct;
    storageService.save(STORAGE_KEYS.PRODUCTS, products);

    return updatedProduct;
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): void {
    const products = this.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    storageService.save(STORAGE_KEYS.PRODUCTS, filtered);
  }

  /**
   * Validate product data
   */
  validateProduct(product: Partial<Product>): ValidationResult {
    const errors: Record<string, string> = {};

    // Validate name
    if (!product.name || product.name.trim() === '') {
      errors.name = 'اسم المنتج مطلوب';
    }

    // Validate price
    if (product.price === undefined || product.price <= 0) {
      errors.price = 'السعر يجب أن يكون أكبر من صفر';
    }

    // Validate categoryId
    if (!product.categoryId || product.categoryId.trim() === '') {
      errors.categoryId = 'التصنيف مطلوب';
    } else {
      const categories = this.getAllCategories();
      const categoryExists = categories.some(c => c.id === product.categoryId);
      if (!categoryExists && categories.length > 0) {
        errors.categoryId = 'التصنيف غير موجود';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Get all categories
   */
  getAllCategories(): Category[] {
    return storageService.load<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
  }

  /**
   * Add a new category
   */
  addCategory(name: string): Category {
    if (!name || name.trim() === '') {
      throw new Error('اسم التصنيف مطلوب');
    }

    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };

    const categories = this.getAllCategories();
    categories.push(category);
    storageService.save(STORAGE_KEYS.CATEGORIES, categories);

    return category;
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string): void {
    const categories = this.getAllCategories();
    const filtered = categories.filter(c => c.id !== id);
    storageService.save(STORAGE_KEYS.CATEGORIES, filtered);
  }

  /**
   * Initialize default data if empty
   */
  initializeDefaultData(): void {
    const categories = this.getAllCategories();
    if (categories.length === 0) {
      const defaultCategories = [
        { id: 'cat-1', name: 'مشروبات ساخنة' },
        { id: 'cat-2', name: 'مشروبات باردة' },
        { id: 'cat-3', name: 'حلويات' },
        { id: 'cat-4', name: 'وجبات خفيفة' },
      ];
      storageService.save(STORAGE_KEYS.CATEGORIES, defaultCategories);
    }

    const products = this.getAllProducts();
    if (products.length === 0) {
      const defaultProducts: Product[] = [
        { id: 'prod-1', name: 'قهوة عربية', price: 15, categoryId: 'cat-1' },
        { id: 'prod-2', name: 'كابتشينو', price: 25, categoryId: 'cat-1' },
        { id: 'prod-3', name: 'لاتيه', price: 28, categoryId: 'cat-1' },
        { id: 'prod-4', name: 'شاي', price: 10, categoryId: 'cat-1' },
        { id: 'prod-5', name: 'عصير برتقال', price: 20, categoryId: 'cat-2' },
        { id: 'prod-6', name: 'سموذي فراولة', price: 30, categoryId: 'cat-2' },
        { id: 'prod-7', name: 'كيك شوكولاتة', price: 35, categoryId: 'cat-3' },
        { id: 'prod-8', name: 'كرواسون', price: 18, categoryId: 'cat-4' },
      ];
      storageService.save(STORAGE_KEYS.PRODUCTS, defaultProducts);
    }
  }
}

export const productService = new ProductService();
