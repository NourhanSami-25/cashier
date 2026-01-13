import { CartItem, Invoice, InvoiceItem, PaymentMethod } from '@/types/pos';
import { POS_CONFIG, STORAGE_KEYS } from '@/config/pos.config';
import { storageService } from './storageService';

class InvoiceService {
  /**
   * Calculate subtotal from cart items
   * subtotal = Σ(unitPrice × quantity)
   */
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  /**
   * Calculate service fee from subtotal
   * serviceFee = subtotal × serviceFeePercentage
   */
  calculateServiceFee(subtotal: number): number {
    return subtotal * POS_CONFIG.serviceFeePercentage;
  }

  /**
   * Calculate tax from subtotal
   * tax = subtotal × taxPercentage
   */
  calculateTax(subtotal: number): number {
    return subtotal * POS_CONFIG.taxPercentage;
  }

  /**
   * Calculate total
   * total = subtotal + serviceFee + tax
   */
  calculateTotal(subtotal: number, serviceFee: number, tax: number): number {
    return subtotal + serviceFee + tax;
  }

  /**
   * Format currency with 2 decimal places
   */
  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Generate unique invoice number
   */
  generateInvoiceNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-6);
    return `INV-${dateStr}-${timeStr}`;
  }

  /**
   * Create invoice from cart items
   */
  createInvoice(items: CartItem[], paymentMethod: PaymentMethod): Invoice {
    const subtotal = this.calculateSubtotal(items);
    const serviceFee = this.calculateServiceFee(subtotal);
    const tax = this.calculateTax(subtotal);
    const total = this.calculateTotal(subtotal, serviceFee, tax);

    const invoiceItems: InvoiceItem[] = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      itemTotal: item.unitPrice * item.quantity,
    }));

    return {
      id: crypto.randomUUID(),
      invoiceNumber: this.generateInvoiceNumber(),
      dateTime: new Date(),
      items: invoiceItems,
      subtotal,
      serviceFee,
      tax,
      total,
      paymentMethod,
      isPaid: true,
    };
  }

  /**
   * Save invoice to storage
   */
  saveInvoice(invoice: Invoice): void {
    const invoices = this.getAllInvoices();
    invoices.push(invoice);
    storageService.save(STORAGE_KEYS.INVOICES, invoices);
  }

  /**
   * Get all invoices from storage
   */
  getAllInvoices(): Invoice[] {
    return storageService.load<Invoice[]>(STORAGE_KEYS.INVOICES) || [];
  }

  /**
   * Get invoices by date
   */
  getInvoicesByDate(date: Date): Invoice[] {
    const invoices = this.getAllInvoices();
    const targetDate = date.toISOString().slice(0, 10);
    
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateTime).toISOString().slice(0, 10);
      return invoiceDate === targetDate;
    });
  }
}

export const invoiceService = new InvoiceService();
