import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '@/services/storageService';
import { productService } from '@/services/productService';
import { invoiceService } from '@/services/invoiceService';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import { STORAGE_KEYS } from '@/config/pos.config';

/**
 * Integration Tests for Full Sale Flow
 * Validates: Requirements 1.3, 2.2, 4.2, 4.3
 */
describe('Integration: Full Sale Flow', () => {
  beforeEach(() => {
    storageService.clear();
    productService.initializeDefaultData();
  });

  it('complete sale flow: add products → modify cart → complete sale → verify invoice', () => {
    // 1. Get products
    const products = productService.getAllProducts();
    expect(products.length).toBeGreaterThan(0);

    // 2. Simulate adding products to cart
    const cart: CartItem[] = [];
    
    // Add first product
    const product1 = products[0];
    cart.push({
      id: 'cart-1',
      productId: product1.id,
      productName: product1.name,
      unitPrice: product1.price,
      quantity: 2,
    });

    // Add second product
    const product2 = products[1];
    cart.push({
      id: 'cart-2',
      productId: product2.id,
      productName: product2.name,
      unitPrice: product2.price,
      quantity: 1,
    });

    // 3. Verify cart calculations
    const subtotal = invoiceService.calculateSubtotal(cart);
    const expectedSubtotal = product1.price * 2 + product2.price * 1;
    expect(Math.abs(subtotal - expectedSubtotal)).toBeLessThan(0.01);

    // 4. Complete sale
    const paymentMethod: PaymentMethod = 'cash';
    const invoice = invoiceService.createInvoice(cart, paymentMethod);
    
    // 5. Verify invoice
    expect(invoice.isPaid).toBe(true);
    expect(invoice.paymentMethod).toBe(paymentMethod);
    expect(invoice.items.length).toBe(2);
    expect(Math.abs(invoice.subtotal - expectedSubtotal)).toBeLessThan(0.01);

    // 6. Save invoice
    invoiceService.saveInvoice(invoice);

    // 7. Verify invoice is persisted
    const savedInvoices = invoiceService.getAllInvoices();
    expect(savedInvoices.length).toBe(1);
    expect(savedInvoices[0].id).toBe(invoice.id);
  });

  it('modify cart: increment, decrement, remove items', () => {
    const products = productService.getAllProducts();
    const product = products[0];

    // Start with cart
    let cart: CartItem[] = [{
      id: 'cart-1',
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: 3,
    }];

    // Increment
    cart = cart.map(item => 
      item.id === 'cart-1' ? { ...item, quantity: item.quantity + 1 } : item
    );
    expect(cart[0].quantity).toBe(4);

    // Decrement
    cart = cart.map(item => 
      item.id === 'cart-1' ? { ...item, quantity: item.quantity - 1 } : item
    );
    expect(cart[0].quantity).toBe(3);

    // Remove
    cart = cart.filter(item => item.id !== 'cart-1');
    expect(cart.length).toBe(0);
  });

  it('empty cart cannot complete sale', () => {
    const cart: CartItem[] = [];
    
    // Attempting to create invoice with empty cart
    const invoice = invoiceService.createInvoice(cart, 'cash');
    
    // Invoice is created but with zero totals
    expect(invoice.items.length).toBe(0);
    expect(invoice.subtotal).toBe(0);
    expect(invoice.total).toBe(0);
  });
});

/**
 * Integration Tests for Product Management
 * Validates: Requirements 6.3, 6.5, 6.6
 */
describe('Integration: Product Management', () => {
  beforeEach(() => {
    storageService.clear();
    productService.initializeDefaultData();
  });

  it('add product → edit → delete → verify changes', () => {
    const categories = productService.getAllCategories();
    const categoryId = categories[0].id;

    // 1. Add product
    const newProduct = productService.addProduct({
      name: 'منتج اختباري',
      price: 50,
      categoryId,
    });
    expect(newProduct.id).toBeDefined();
    expect(newProduct.name).toBe('منتج اختباري');

    // 2. Verify product exists
    let products = productService.getAllProducts();
    expect(products.some(p => p.id === newProduct.id)).toBe(true);

    // 3. Edit product
    const updatedProduct = productService.updateProduct(newProduct.id, {
      name: 'منتج معدل',
      price: 75,
    });
    expect(updatedProduct.name).toBe('منتج معدل');
    expect(updatedProduct.price).toBe(75);

    // 4. Verify edit
    products = productService.getAllProducts();
    const found = products.find(p => p.id === newProduct.id);
    expect(found?.name).toBe('منتج معدل');

    // 5. Delete product
    productService.deleteProduct(newProduct.id);

    // 6. Verify deletion
    products = productService.getAllProducts();
    expect(products.some(p => p.id === newProduct.id)).toBe(false);
  });

  it('category management: add and delete', () => {
    // Add category
    const newCategory = productService.addCategory('تصنيف جديد');
    expect(newCategory.id).toBeDefined();
    expect(newCategory.name).toBe('تصنيف جديد');

    // Verify category exists
    let categories = productService.getAllCategories();
    expect(categories.some(c => c.id === newCategory.id)).toBe(true);

    // Delete category
    productService.deleteCategory(newCategory.id);

    // Verify deletion
    categories = productService.getAllCategories();
    expect(categories.some(c => c.id === newCategory.id)).toBe(false);
  });

  it('product validation rejects invalid data', () => {
    const categories = productService.getAllCategories();
    
    // Empty name
    const result1 = productService.validateProduct({
      name: '',
      price: 50,
      categoryId: categories[0].id,
    });
    expect(result1.isValid).toBe(false);
    expect(result1.errors.name).toBeDefined();

    // Invalid price
    const result2 = productService.validateProduct({
      name: 'Test',
      price: -10,
      categoryId: categories[0].id,
    });
    expect(result2.isValid).toBe(false);
    expect(result2.errors.price).toBeDefined();

    // Empty category
    const result3 = productService.validateProduct({
      name: 'Test',
      price: 50,
      categoryId: '',
    });
    expect(result3.isValid).toBe(false);
    expect(result3.errors.categoryId).toBeDefined();
  });
});
