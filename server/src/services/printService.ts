import { Invoice } from '../models';

export class PrintService {
  /**
   * Format invoice for printing
   */
  formatInvoiceForPrint(invoice: Invoice): string {
    const lines: string[] = [];
    
    // Header
    lines.push('========================================');
    lines.push('         CASHIER POS RECEIPT');
    lines.push('========================================');
    lines.push('');
    
    // Invoice details
    lines.push(`Invoice Number: ${invoice.invoiceNumber}`);
    lines.push(`Date: ${invoice.createdAt.toLocaleString()}`);
    if (invoice.completedAt) {
      lines.push(`Completed: ${invoice.completedAt.toLocaleString()}`);
    }
    lines.push('');
    lines.push('========================================');
    lines.push('ITEMS');
    lines.push('========================================');
    
    // Items
    invoice.items.forEach(item => {
      lines.push(`${item.productName}`);
      lines.push(`  ${item.quantity} x ${item.productPrice.toFixed(2)} = ${item.lineTotal.toFixed(2)}`);
    });
    
    lines.push('');
    lines.push('========================================');
    lines.push('TOTALS');
    lines.push('========================================');
    
    // Totals
    lines.push(`Subtotal:        ${invoice.subtotal.toFixed(2)}`);
    lines.push(`Service Charge:  ${invoice.serviceCharge.toFixed(2)}`);
    lines.push(`Tax:             ${invoice.tax.toFixed(2)}`);
    lines.push('----------------------------------------');
    lines.push(`TOTAL:           ${invoice.total.toFixed(2)}`);
    lines.push('========================================');
    lines.push('');
    lines.push('       Thank you for your visit!');
    lines.push('========================================');
    
    return lines.join('\n');
  }
}
