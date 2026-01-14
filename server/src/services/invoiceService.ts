import { InvoiceRepository } from '../repositories/invoiceRepository';
import { InvoiceItemRepository } from '../repositories/invoiceItemRepository';
import { ProductRepository } from '../repositories/productRepository';
import { SettingsRepository } from '../repositories/settingsRepository';
import { Invoice } from '../models';
import {
  calculateSubtotal,
  calculateServiceCharge,
  calculateTax,
  calculateTotal
} from '../utils/calculations';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;
  private invoiceItemRepository: InvoiceItemRepository;
  private productRepository: ProductRepository;
  private settingsRepository: SettingsRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
    this.invoiceItemRepository = new InvoiceItemRepository();
    this.productRepository = new ProductRepository();
    this.settingsRepository = new SettingsRepository();
  }

  /**
   * Create a new empty invoice
   */
  createInvoice(): Invoice {
    return this.invoiceRepository.create();
  }

  /**
   * Get invoice by ID
   */
  getInvoiceById(id: string): Invoice | null {
    return this.invoiceRepository.findById(id);
  }

  /**
   * Calculate and update invoice totals
   */
  calculateInvoiceTotals(invoice: Invoice): Invoice {
    const settings = this.settingsRepository.getSettings();
    
    // Calculate subtotal from items
    const subtotal = calculateSubtotal(invoice.items);
    
    // Calculate service charge
    const serviceCharge = calculateServiceCharge(subtotal, settings.serviceRate);
    
    // Calculate tax
    const tax = calculateTax(subtotal, serviceCharge, settings.taxRate);
    
    // Calculate total
    const total = calculateTotal(subtotal, serviceCharge, tax);
    
    // Update invoice with calculated values
    invoice.subtotal = subtotal;
    invoice.serviceCharge = serviceCharge;
    invoice.tax = tax;
    invoice.total = total;
    
    // Persist to database
    return this.invoiceRepository.update(invoice);
  }

  /**
   * Add item to invoice or increase quantity if already exists
   */
  addItemToInvoice(invoiceId: string, productId: string, quantity: number): Invoice {
    // Get invoice
    const invoice = this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with id ${invoiceId} not found`);
    }

    // Check if invoice is completed
    if (invoice.completedAt) {
      throw new BusinessLogicError('Cannot modify a completed invoice');
    }

    // Get product
    const product = this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    // Check if item already exists in invoice
    const existingItem = invoice.items.find(item => item.productId === productId);
    
    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity;
      this.invoiceItemRepository.update(existingItem.id, newQuantity);
    } else {
      // Add new item
      this.invoiceItemRepository.create(
        invoiceId,
        productId,
        product.name,
        product.price,
        quantity
      );
    }

    // Reload invoice with updated items
    const updatedInvoice = this.invoiceRepository.findById(invoiceId)!;
    
    // Recalculate totals
    return this.calculateInvoiceTotals(updatedInvoice);
  }

  /**
   * Update item quantity in invoice
   */
  updateItemQuantity(invoiceId: string, itemId: string, quantity: number): Invoice {
    // Get invoice
    const invoice = this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with id ${invoiceId} not found`);
    }

    // Check if invoice is completed
    if (invoice.completedAt) {
      throw new BusinessLogicError('Cannot modify a completed invoice');
    }

    // Update item quantity
    const updated = this.invoiceItemRepository.update(itemId, quantity);
    if (!updated) {
      throw new NotFoundError(`Invoice item with id ${itemId} not found`);
    }

    // Reload invoice with updated items
    const updatedInvoice = this.invoiceRepository.findById(invoiceId)!;
    
    // Recalculate totals
    return this.calculateInvoiceTotals(updatedInvoice);
  }

  /**
   * Remove item from invoice
   */
  removeItemFromInvoice(invoiceId: string, itemId: string): Invoice {
    // Get invoice
    const invoice = this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with id ${invoiceId} not found`);
    }

    // Check if invoice is completed
    if (invoice.completedAt) {
      throw new BusinessLogicError('Cannot modify a completed invoice');
    }

    // Delete item
    const deleted = this.invoiceItemRepository.delete(itemId);
    if (!deleted) {
      throw new NotFoundError(`Invoice item with id ${itemId} not found`);
    }

    // Reload invoice with updated items
    const updatedInvoice = this.invoiceRepository.findById(invoiceId)!;
    
    // Recalculate totals
    return this.calculateInvoiceTotals(updatedInvoice);
  }

  /**
   * Complete invoice
   */
  completeInvoice(invoiceId: string): Invoice {
    // Get invoice
    const invoice = this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with id ${invoiceId} not found`);
    }

    // Check if invoice has items
    if (invoice.items.length === 0) {
      throw new BusinessLogicError('Cannot complete an empty invoice');
    }

    // Check if already completed
    if (invoice.completedAt) {
      throw new BusinessLogicError('Invoice is already completed');
    }

    // Mark as completed
    const completedAt = new Date();
    return this.invoiceRepository.complete(invoiceId, completedAt)!;
  }
}
