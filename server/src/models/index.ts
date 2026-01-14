/**
 * Data Models
 * Pure data structures with no business logic
 */

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  completedAt: Date | null;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Settings {
  taxRate: number;      // e.g., 0.15 for 15%
  serviceRate: number;  // e.g., 0.10 for 10%
}

export interface DailyReport {
  date: Date;
  totalSales: number;
  invoiceCount: number;
  totalRevenue: number;
  totalServiceCharges: number;
  totalTaxes: number;
  invoices: Invoice[];
}
