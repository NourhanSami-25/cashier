import { getDatabase } from '../config/database';
import { InvoiceItem } from '../models';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceItemRepository {
  /**
   * Create a new invoice item
   */
  create(
    invoiceId: string,
    productId: string,
    productName: string,
    productPrice: number,
    quantity: number
  ): InvoiceItem {
    const db = getDatabase();
    const id = uuidv4();
    const lineTotal = productPrice * quantity;
    
    db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, product_price, quantity, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, invoiceId, productId, productName, productPrice, quantity, lineTotal);
    
    return {
      id,
      invoiceId,
      productId,
      productName,
      productPrice,
      quantity,
      lineTotal
    };
  }

  /**
   * Retrieve all items for an invoice
   */
  findByInvoiceId(invoiceId: string): InvoiceItem[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      invoiceId: row.invoice_id,
      productId: row.product_id,
      productName: row.product_name,
      productPrice: row.product_price,
      quantity: row.quantity,
      lineTotal: row.line_total
    }));
  }

  /**
   * Retrieve invoice item by ID
   */
  findById(id: string): InvoiceItem | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM invoice_items WHERE id = ?').get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      productId: row.product_id,
      productName: row.product_name,
      productPrice: row.product_price,
      quantity: row.quantity,
      lineTotal: row.line_total
    };
  }

  /**
   * Update item quantity
   */
  update(id: string, quantity: number): InvoiceItem | null {
    const db = getDatabase();
    
    // Get current item to calculate new line total
    const item = this.findById(id);
    if (!item) {
      return null;
    }
    
    const lineTotal = item.productPrice * quantity;
    
    const result = db.prepare(`
      UPDATE invoice_items 
      SET quantity = ?, line_total = ?
      WHERE id = ?
    `).run(quantity, lineTotal, id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.findById(id);
  }

  /**
   * Delete invoice item by ID
   */
  delete(id: string): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM invoice_items WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
