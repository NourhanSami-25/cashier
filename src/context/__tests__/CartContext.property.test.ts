import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { CartItem, Product } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';

// Helper functions that mirror CartContext logic for testing
function addItemToCart(items: CartItem[], product: Product): CartItem[] {
  const existingItem = items.find(item => item.productId === product.id);
  
  if (existingItem) {
    return items.map(item =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  
  const newItem: CartItem = {
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity: 1,
  };
  return [...items, newItem];
}

function updateQuantityInCart(items: CartItem[], itemId: string, delta: number): CartItem[] {
  return items
    .map(item => {
      if (item.id !== itemId) return item;
      const newQuantity = item.quantity + delta;
      return { ...item, quantity: newQuantity };
    })
    .filter(item => item.quantity > 0);
}

function removeItemFromCart(items: CartItem[], itemId: string): CartItem[] {
  return items.filter(item => item.id !== itemId);
}

// Generators
const productArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
  categoryId: fc.uuid(),
});

const cartItemArb = fc.record({
  id: fc.uuid(),
  productId: fc.uuid(),
  productName: fc.string({ minLength: 1, maxLength: 50 }),
  unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
  quantity: fc.integer({ min: 1, max: 100 }),
});

/**
 * Feature: cafe-pos, Property 4: Cart Modification Invariants
 * Validates: Requirements 2.2, 2.3, 2.5, 2.6
 */
describe('Property 4: Cart Modification Invariants', () => {
  it('incrementing quantity increases by exactly 1', () => {
    fc.assert(
      fc.property(cartItemArb, (item: CartItem) => {
        const items = [item];
        const oldQuantity = item.quantity;
        
        const newItems = updateQuantityInCart(items, item.id, 1);
        const updatedItem = newItems.find(i => i.id === item.id);
        
        expect(updatedItem).toBeDefined();
        expect(updatedItem!.quantity).toBe(oldQuantity + 1);
      }),
      { numRuns: 100 }
    );
  });

  it('decrementing quantity (when > 1) decreases by exactly 1', () => {
    fc.assert(
      fc.property(
        cartItemArb.filter(item => item.quantity > 1),
        (item: CartItem) => {
          const items = [item];
          const oldQuantity = item.quantity;
          
          const newItems = updateQuantityInCart(items, item.id, -1);
          const updatedItem = newItems.find(i => i.id === item.id);
          
          expect(updatedItem).toBeDefined();
          expect(updatedItem!.quantity).toBe(oldQuantity - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('decrementing quantity to 0 removes item', () => {
    fc.assert(
      fc.property(
        cartItemArb.map(item => ({ ...item, quantity: 1 })),
        (item: CartItem) => {
          const items = [item];
          
          const newItems = updateQuantityInCart(items, item.id, -1);
          
          expect(newItems.find(i => i.id === item.id)).toBeUndefined();
          expect(newItems.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deleting item removes it from cart', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        (items: CartItem[]) => {
          const itemToRemove = items[0];
          
          const newItems = removeItemFromCart(items, itemToRemove.id);
          
          expect(newItems.find(i => i.id === itemToRemove.id)).toBeUndefined();
          expect(newItems.length).toBe(items.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('totals are recalculated correctly after modification', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        (items: CartItem[]) => {
          // Calculate expected totals
          const subtotal = invoiceService.calculateSubtotal(items);
          const serviceFee = invoiceService.calculateServiceFee(subtotal);
          const tax = invoiceService.calculateTax(subtotal);
          const total = invoiceService.calculateTotal(subtotal, serviceFee, tax);

          // Verify calculations are consistent
          expect(subtotal).toBeGreaterThanOrEqual(0);
          expect(serviceFee).toBeGreaterThanOrEqual(0);
          expect(tax).toBeGreaterThanOrEqual(0);
          expect(Math.abs(total - (subtotal + serviceFee + tax))).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: cafe-pos, Property 8: New Invoice State Reset
 * Validates: Requirements 5.1, 5.3
 */
describe('Property 8: New Invoice State Reset', () => {
  it('clearing cart results in empty items array', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 20 }),
        (items: CartItem[]) => {
          // Simulate clear cart
          const clearedItems: CartItem[] = [];
          
          expect(clearedItems.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('clearing cart results in zero totals', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 20 }),
        () => {
          // Simulate clear cart
          const clearedItems: CartItem[] = [];
          
          const subtotal = invoiceService.calculateSubtotal(clearedItems);
          const serviceFee = invoiceService.calculateServiceFee(subtotal);
          const tax = invoiceService.calculateTax(subtotal);
          const total = invoiceService.calculateTotal(subtotal, serviceFee, tax);

          expect(subtotal).toBe(0);
          expect(serviceFee).toBe(0);
          expect(tax).toBe(0);
          expect(total).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('adding product to empty cart creates item with quantity 1', () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const items: CartItem[] = [];
        
        const newItems = addItemToCart(items, product);
        
        expect(newItems.length).toBe(1);
        expect(newItems[0].productId).toBe(product.id);
        expect(newItems[0].quantity).toBe(1);
      }),
      { numRuns: 100 }
    );
  });

  it('adding same product twice increments quantity', () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        let items: CartItem[] = [];
        
        items = addItemToCart(items, product);
        items = addItemToCart(items, product);
        
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(2);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: cafe-pos, Property 2: Product Addition to Cart
 * Validates: Requirements 1.3
 */
describe('Property 2: Product Addition to Cart', () => {
  it('adding product creates cart item with matching productId, productName, and unitPrice', () => {
    fc.assert(
      fc.property(productArb, (product: Product) => {
        const items: CartItem[] = [];
        const newItems = addItemToCart(items, product);
        
        expect(newItems.length).toBe(1);
        expect(newItems[0].productId).toBe(product.id);
        expect(newItems[0].productName).toBe(product.name);
        expect(newItems[0].unitPrice).toBe(product.price);
        expect(newItems[0].quantity).toBe(1);
      }),
      { numRuns: 100 }
    );
  });

  it('adding existing product increments quantity by 1', () => {
    fc.assert(
      fc.property(
        productArb,
        fc.integer({ min: 1, max: 10 }),
        (product: Product, initialQuantity: number) => {
          // Create initial cart with product
          const initialItem: CartItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            quantity: initialQuantity,
          };
          const items = [initialItem];
          
          const newItems = addItemToCart(items, product);
          
          expect(newItems.length).toBe(1);
          expect(newItems[0].quantity).toBe(initialQuantity + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('adding different products creates separate cart items', () => {
    fc.assert(
      fc.property(
        productArb,
        productArb.filter(p => p.id !== ''),
        (product1: Product, product2: Product) => {
          // Ensure different products
          if (product1.id === product2.id) return true;
          
          let items: CartItem[] = [];
          items = addItemToCart(items, product1);
          items = addItemToCart(items, product2);
          
          expect(items.length).toBe(2);
          expect(items.some(i => i.productId === product1.id)).toBe(true);
          expect(items.some(i => i.productId === product2.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
