import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CartItem, Product, PaymentMethod, Invoice } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';

interface CartState {
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
}

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: PaymentMethod) => Invoice | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  subtotal: 0,
  serviceFee: 0,
  tax: 0,
  total: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calculate totals whenever items change
  const totals = useMemo(() => {
    const subtotal = invoiceService.calculateSubtotal(items);
    const serviceFee = invoiceService.calculateServiceFee(subtotal);
    const tax = invoiceService.calculateTax(subtotal);
    const total = invoiceService.calculateTotal(subtotal, serviceFee, tax);
    return { subtotal, serviceFee, tax, total };
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Increment quantity if product already in cart
        return currentItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Add new item
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
      };
      return [...currentItems, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems(currentItems => {
      return currentItems
        .map(item => {
          if (item.id !== itemId) return item;
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity };
        })
        .filter(item => item.quantity > 0); // Remove items with 0 quantity
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const completeSale = useCallback((paymentMethod: PaymentMethod): Invoice | null => {
    if (items.length === 0) {
      return null;
    }

    const invoice = invoiceService.createInvoice(items, paymentMethod);
    invoiceService.saveInvoice(invoice);
    setItems([]);
    return invoice;
  }, [items]);

  const value: CartContextType = {
    items,
    ...totals,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    completeSale,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export for testing
export { CartContext, initialState };
