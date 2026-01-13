// Category Model
export interface Category {
  id: string;
  name: string;
  icon?: string;
}

// Product Model
export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image?: string;
}

// Cart Item Model
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

// Invoice Item Model
export interface InvoiceItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

// Payment Method Type
export type PaymentMethod = 'cash' | 'card';

// Invoice Model
export interface Invoice {
  id: string;
  invoiceNumber: string;
  dateTime: Date;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
}

// Daily Report Model
export interface DailyReport {
  date: Date;
  totalSales: number;
  invoiceCount: number;
  totalRevenue: number;
  invoices: Invoice[];
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// POS Configuration
export interface POSConfig {
  serviceFeePercentage: number;
  taxPercentage: number;
  currency: string;
}
