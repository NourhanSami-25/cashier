import { useState } from 'react';
import { Invoice } from '@/types/pos';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';
import { FileText, CreditCard, Banknote } from 'lucide-react';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedInvoice(null), 200); // Wait for animation
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">لا توجد فواتير في هذا التاريخ</p>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">قائمة الفواتير</h3>
        </div>
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => handleInvoiceClick(invoice)}
              className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary group-hover:underline transition-all">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatTime(invoice.dateTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {invoice.paymentMethod === 'cash' ? (
                    <Banknote className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {invoice.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}
                  </span>
                </div>
                <div className="text-left min-w-[100px]">
                  <span className="font-bold text-foreground">
                    {invoiceService.formatCurrency(invoice.total)}
                  </span>
                  <span className="text-sm text-muted-foreground mr-1">{POS_CONFIG.currency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
