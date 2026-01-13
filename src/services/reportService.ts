import { Invoice, DailyReport } from '@/types/pos';
import { invoiceService } from './invoiceService';

class ReportService {
  /**
   * Get invoices filtered by date
   */
  getInvoicesByDate(date: Date): Invoice[] {
    return invoiceService.getInvoicesByDate(date);
  }

  /**
   * Get total sales for a specific date
   */
  getTotalSales(date: Date): number {
    const invoices = this.getInvoicesByDate(date);
    return invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }

  /**
   * Get invoice count for a specific date
   */
  getInvoiceCount(date: Date): number {
    const invoices = this.getInvoicesByDate(date);
    return invoices.length;
  }

  /**
   * Generate daily report
   */
  getDailyReport(date: Date): DailyReport {
    const invoices = this.getInvoicesByDate(date);
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);

    return {
      date,
      totalSales,
      invoiceCount: invoices.length,
      totalRevenue,
      invoices,
    };
  }
}

export const reportService = new ReportService();
