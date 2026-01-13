export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Invoice {
  id: string;
  items: CartItem[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card';

export interface Category {
  id: string;
  name: string;
  icon: string;
}
