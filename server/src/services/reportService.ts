import { InvoiceRepository } from '../repositories/invoiceRepository';
import { DailyReport } from '../models';

export class ReportService {
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
  }

  /**
   * Get daily report for a specific date
   */
  getDailyReport(date: Date): DailyReport {
    // Set start of day (00:00:00)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // Set end of day (23:59:59.999)
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get all completed invoices for the date
    const invoices = this.invoiceRepository.findByDateRange(startDate, endDate);

    // Calculate totals
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
    const totalServiceCharges = invoices.reduce((sum, invoice) => sum + invoice.serviceCharge, 0);
    const totalTaxes = invoices.reduce((sum, invoice) => sum + invoice.tax, 0);
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const invoiceCount = invoices.length;

    return {
      date,
      totalSales,
      invoiceCount,
      totalRevenue,
      totalServiceCharges,
      totalTaxes,
      invoices
    };
  }
}
