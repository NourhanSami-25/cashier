import { Invoice } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';
import { X, FileText, Calendar, Clock, CreditCard, Banknote, ShoppingBag, Printer } from 'lucide-react';
import { useEffect } from 'react';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailsModal({ invoice, isOpen, onClose }: InvoiceDetailsModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    // يمكن تحسين هذا لاحقاً لطباعة الفاتورة فقط
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-modal-title"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 id="invoice-modal-title" className="text-xl font-bold">تفاصيل الفاتورة</h2>
                <p className="text-sm opacity-90">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التاريخ</p>
                  <p className="font-medium text-foreground">{formatDate(invoice.dateTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الوقت</p>
                  <p className="font-medium text-foreground">{formatTime(invoice.dateTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border/50 col-span-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {invoice.paymentMethod === 'cash' ? (
                    <Banknote className="w-5 h-5 text-primary" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">طريقة الدفع</p>
                  <p className="font-medium text-foreground">
                    {invoice.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة ائتمانية'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">المنتجات</h3>
                <span className="text-sm text-muted-foreground">({invoice.items.length} منتج)</span>
              </div>
              <div className="bg-secondary/30 rounded-xl overflow-hidden border border-border/50">
                <table className="w-full">
                  <thead className="bg-secondary/70">
                    <tr>
                      <th className="text-right p-4 text-sm font-semibold text-foreground">المنتج</th>
                      <th className="text-center p-4 text-sm font-semibold text-foreground">الكمية</th>
                      <th className="text-center p-4 text-sm font-semibold text-foreground">السعر</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="hover:bg-secondary/40 transition-colors">
                        <td className="p-4 text-foreground font-medium">{item.productName}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 bg-primary/10 text-primary rounded-lg font-medium">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-center text-muted-foreground">
                          {invoiceService.formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-4 text-left font-semibold text-foreground">
                          {invoiceService.formatCurrency(item.itemTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 space-y-3 border border-primary/20">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold text-foreground text-lg">
                  {invoiceService.formatCurrency(invoice.subtotal)} {POS_CONFIG.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">
                  رسوم الخدمة ({(POS_CONFIG.serviceFeePercentage * 100).toFixed(0)}%)
                </span>
                <span className="font-semibold text-foreground text-lg">
                  {invoiceService.formatCurrency(invoice.serviceFee)} {POS_CONFIG.currency}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">
                  الضريبة ({(POS_CONFIG.taxPercentage * 100).toFixed(0)}%)
                </span>
                <span className="font-semibold text-foreground text-lg">
                  {invoiceService.formatCurrency(invoice.tax)} {POS_CONFIG.currency}
                </span>
              </div>
              <div className="pt-4 border-t-2 border-primary/30 flex justify-between items-center">
                <span className="text-xl font-bold text-foreground">الإجمالي النهائي</span>
                <span className="text-3xl font-bold text-primary">
                  {invoiceService.formatCurrency(invoice.total)} {POS_CONFIG.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-secondary/30 border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
            >
              إغلاق
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
