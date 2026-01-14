import { Invoice } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';

interface PrintableInvoiceProps {
  invoice: Invoice;
}

export function PrintableInvoice({ invoice }: PrintableInvoiceProps) {
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="print-invoice p-8 max-w-md mx-auto bg-white text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Cashier POS</h1>
        <p className="text-sm text-gray-600">فاتورة ضريبية</p>
      </div>

      {/* Invoice Info */}
      <div className="border-t border-b border-gray-300 py-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>رقم الفاتورة:</span>
          <span className="font-medium">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>التاريخ والوقت:</span>
          <span>{formatDateTime(invoice.dateTime)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>طريقة الدفع:</span>
          <span>{invoice.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</span>
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-right py-2">الصنف</th>
            <th className="text-center py-2">الكمية</th>
            <th className="text-center py-2">السعر</th>
            <th className="text-left py-2">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2">{item.productName}</td>
              <td className="text-center py-2">{item.quantity}</td>
              <td className="text-center py-2">
                {invoiceService.formatCurrency(item.unitPrice)}
              </td>
              <td className="text-left py-2">
                {invoiceService.formatCurrency(item.itemTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-gray-300 pt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span>المجموع الفرعي:</span>
          <span>{invoiceService.formatCurrency(invoice.subtotal)} {POS_CONFIG.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>رسوم الخدمة ({(POS_CONFIG.serviceFeePercentage * 100).toFixed(0)}%):</span>
          <span>{invoiceService.formatCurrency(invoice.serviceFee)} {POS_CONFIG.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>الضريبة ({(POS_CONFIG.taxPercentage * 100).toFixed(0)}%):</span>
          <span>{invoiceService.formatCurrency(invoice.tax)} {POS_CONFIG.currency}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
          <span>الإجمالي:</span>
          <span>{invoiceService.formatCurrency(invoice.total)} {POS_CONFIG.currency}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-sm text-gray-600">
        <p>شكراً لزيارتكم</p>
        <p>نتمنى لكم يوماً سعيداً</p>
      </div>
    </div>
  );
}
