import { Invoice } from '@/types/pos';

class PrintService {
  /**
   * Print invoice using browser print dialog
   */
  printInvoice(invoice: Invoice): void {
    // Store current body content
    const originalContent = document.body.innerHTML;
    
    // Create print content
    const printContent = this.generatePrintHTML(invoice);
    
    // Replace body with print content
    document.body.innerHTML = printContent;
    
    // Trigger print
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reload to restore React state
    window.location.reload();
  }

  /**
   * Generate HTML for printing
   */
  private generatePrintHTML(invoice: Invoice): string {
    const formatCurrency = (amount: number) => amount.toFixed(2);
    const formatDateTime = (date: Date) => {
      return new Date(date).toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const itemsHTML = invoice.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${formatCurrency(item.itemTotal)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .info {
            border-top: 1px solid #333;
            border-bottom: 1px solid #333;
            padding: 10px 0;
            margin-bottom: 15px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th {
            padding: 8px;
            border-bottom: 2px solid #333;
            text-align: right;
          }
          .totals {
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 5px 0;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cafe POS</h1>
          <p>فاتورة ضريبية</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span>رقم الفاتورة:</span>
            <span>${invoice.invoiceNumber}</span>
          </div>
          <div class="info-row">
            <span>التاريخ والوقت:</span>
            <span>${formatDateTime(invoice.dateTime)}</span>
          </div>
          <div class="info-row">
            <span>طريقة الدفع:</span>
            <span>${invoice.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: center;">السعر</th>
              <th style="text-align: left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>المجموع الفرعي:</span>
            <span>${formatCurrency(invoice.subtotal)} ج.م</span>
          </div>
          <div class="total-row">
            <span>رسوم الخدمة (10%):</span>
            <span>${formatCurrency(invoice.serviceFee)} ج.م</span>
          </div>
          <div class="total-row">
            <span>الضريبة (14%):</span>
            <span>${formatCurrency(invoice.tax)} ج.م</span>
          </div>
          <div class="total-row grand-total">
            <span>الإجمالي:</span>
            <span>${formatCurrency(invoice.total)} ج.م</span>
          </div>
        </div>
        
        <div class="footer">
          <p>شكراً لزيارتكم</p>
          <p>نتمنى لكم يوماً سعيداً</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const printService = new PrintService();
