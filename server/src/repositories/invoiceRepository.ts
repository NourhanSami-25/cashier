import { getDatabase } from '../config/database';
import { Invoice } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItemRepository } from './invoiceItemRepository';

export class InvoiceRepository {
  private invoiceItemRepository: InvoiceItemRepository;

  constructor() {
    this.invoiceItemRepository = new InvoiceItemRepository();
  }

  /**
   * Create a new empty invoice
   */
  create(): Invoice {
    const db = getDatabase();
    const id = uuidv4();
    const createdAt = new Date();
    const invoiceNumber = this.generateInvoiceNumber();
    
    db.prepare(`
      INSERT INTO invoices (id, invoice_number, created_at, subtotal, service_charge, tax, total)
      VALUES (?, ?, ?, 0, 0, 0, 0)
    `).run(id, invoiceNumber, createdAt.toISOString());
    
    return {
      id,
      invoiceNumber,
      createdAt,
      completedAt: null,
      subtotal: 0,
      serviceCharge: 0,
      tax: 0,
      total: 0,
      items: []
    };
  }

  /**
   * Generate unique invoice number
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime();
    return `INV-${year}${month}${day}-${timestamp}`;
  }

  /**
   * Retrieve invoice by ID with all items
   */
  findById(id: string): Invoice | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as any;
    
    if (!row) {
      return null;
    }
    
    const items = this.invoiceItemRepository.findByInvoiceId(id);
    
    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      subtotal: row.subtotal,
      serviceCharge: row.service_charge,
      tax: row.tax,
      total: row.total,
      items
    };
  }

  /**
   * Retrieve invoices in date range
   */
  findByDateRange(startDate: Date, endDate: Date): Invoice[] {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT * FROM invoices 
      WHERE completed_at IS NOT NULL
        AND completed_at >= ? 
        AND completed_at <= ?
      ORDER BY completed_at DESC
    `).all(startDate.toISOString(), endDate.toISOString()) as any[];
    
    return rows.map(row => {
      const items = this.invoiceItemRepository.findByInvoiceId(row.id);
      
      return {
        id: row.id,
        invoiceNumber: row.invoice_number,
        createdAt: new Date(row.created_at),
        completedAt: row.completed_at ? new Date(row.completed_at) : null,
        subtotal: row.subtotal,
        serviceCharge: row.service_charge,
        tax: row.tax,
        total: row.total,
        items
      };
    });
  }

  /**
   * Update invoice totals
   */
  update(invoice: Invoice): Invoice {
    const db = getDatabase();
    
    db.prepare(`
      UPDATE invoices 
      SET subtotal = ?, service_charge = ?, tax = ?, total = ?
      WHERE id = ?
    `).run(
      invoice.subtotal,
      invoice.serviceCharge,
      invoice.tax,
      invoice.total,
      invoice.id
    );
    
    return this.findById(invoice.id)!;
  }

  /**
   * Mark invoice as completed
   */
  complete(id: string, completedAt: Date): Invoice | null {
    const db = getDatabase();
    
    const result = db.prepare(`
      UPDATE invoices 
      SET completed_at = ?
      WHERE id = ?
    `).run(completedAt.toISOString(), id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.findById(id);
  }
}
