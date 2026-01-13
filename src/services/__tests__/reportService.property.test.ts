import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Invoice, InvoiceItem, PaymentMethod } from '@/types/pos';
import { reportService } from '../reportService';
import { storageService } from '../storageService';
import { STORAGE_KEYS } from '@/config/pos.config';

// Generators
const invoiceItemArb = fc.record({
  productId: fc.uuid(),
  productName: fc.string({ minLength: 1, maxLength: 50 }),
  unitPrice: fc.integer({ min: 1, max: 1000000 }).map(n => n / 100),
  quantity: fc.integer({ min: 1, max: 100 }),
  itemTotal: fc.integer({ min: 1, max: 100000000 }).map(n => n / 100),
});

const invoiceArb = (date: Date) =>
  fc.record({
    id: fc.uuid(),
    invoiceNumber: fc.string({ minLength: 10, maxLength: 20 }),
    dateTime: fc.constant(date),
    items: fc.array(invoiceItemArb, { minLength: 1, maxLength: 10 }),
    subtotal: fc.integer({ min: 1, max: 100000000 }).map(n => n / 100),
    serviceFee: fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
    tax: fc.integer({ min: 0, max: 10000000 }).map(n => n / 100),
    total: fc.integer({ min: 1, max: 200000000 }).map(n => n / 100),
    paymentMethod: fc.constantFrom('cash', 'card') as fc.Arbitrary<PaymentMethod>,
    isPaid: fc.constant(true),
  });

/**
 * Feature: cafe-pos, Property 10: Report Data Accuracy
 * Validates: Requirements 7.2, 7.3
 */
describe('Property 10: Report Data Accuracy', () => {
  beforeEach(() => {
    storageService.clear();
  });

  it('totalSales equals sum of all invoice totals for the date', () => {
    const targetDate = new Date('2025-01-13');
    
    fc.assert(
      fc.property(
        fc.array(invoiceArb(targetDate), { minLength: 1, maxLength: 10 }),
        (invoices: Invoice[]) => {
          storageService.save(STORAGE_KEYS.INVOICES, invoices);
          
          const expectedTotal = invoices.reduce((sum, inv) => sum + inv.total, 0);
          const actualTotal = reportService.getTotalSales(targetDate);
          
          expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoiceCount equals number of invoices for the date', () => {
    const targetDate = new Date('2025-01-13');
    
    fc.assert(
      fc.property(
        fc.array(invoiceArb(targetDate), { minLength: 0, maxLength: 20 }),
        (invoices: Invoice[]) => {
          storageService.save(STORAGE_KEYS.INVOICES, invoices);
          
          const actualCount = reportService.getInvoiceCount(targetDate);
          
          expect(actualCount).toBe(invoices.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all returned invoices have dateTime matching selected date', () => {
    const targetDate = new Date('2025-01-13');
    
    fc.assert(
      fc.property(
        fc.array(invoiceArb(targetDate), { minLength: 1, maxLength: 10 }),
        (invoices: Invoice[]) => {
          storageService.save(STORAGE_KEYS.INVOICES, invoices);
          
          const report = reportService.getDailyReport(targetDate);
          const targetDateStr = targetDate.toISOString().slice(0, 10);
          
          report.invoices.forEach(invoice => {
            const invoiceDateStr = new Date(invoice.dateTime).toISOString().slice(0, 10);
            expect(invoiceDateStr).toBe(targetDateStr);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('daily report contains correct summary data', () => {
    const targetDate = new Date('2025-01-13');
    
    fc.assert(
      fc.property(
        fc.array(invoiceArb(targetDate), { minLength: 1, maxLength: 10 }),
        (invoices: Invoice[]) => {
          storageService.save(STORAGE_KEYS.INVOICES, invoices);
          
          const report = reportService.getDailyReport(targetDate);
          
          const expectedTotalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
          const expectedRevenue = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
          
          expect(report.invoiceCount).toBe(invoices.length);
          expect(Math.abs(report.totalSales - expectedTotalSales)).toBeLessThan(0.01);
          expect(Math.abs(report.totalRevenue - expectedRevenue)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invoices from different dates are not included', () => {
    const targetDate = new Date('2025-01-13');
    const otherDate = new Date('2025-01-14');
    
    fc.assert(
      fc.property(
        fc.array(invoiceArb(targetDate), { minLength: 1, maxLength: 5 }),
        fc.array(invoiceArb(otherDate), { minLength: 1, maxLength: 5 }),
        (targetInvoices: Invoice[], otherInvoices: Invoice[]) => {
          const allInvoices = [...targetInvoices, ...otherInvoices];
          storageService.save(STORAGE_KEYS.INVOICES, allInvoices);
          
          const report = reportService.getDailyReport(targetDate);
          
          // Should only include target date invoices
          expect(report.invoiceCount).toBe(targetInvoices.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
