import React from 'react';
import { CartItem as CartItemType, PaymentMethod } from '@/types/pos';
import { CartItem } from './CartItem';
import { ShoppingCart, CreditCard, Banknote, RotateCcw, Printer, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';

interface CartProps {
  items: CartItemType[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  onQuantityChange: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (paymentMethod: PaymentMethod) => void;
  onPrint?: () => void;
}

export function Cart({
  items,
  subtotal,
  serviceFee,
  tax,
  total,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCompleteSale,
  onPrint,
}: CartProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cash');
  const [isSaleCompleted, setIsSaleCompleted] = React.useState(false);

  // Reset sale completed state when items change
  React.useEffect(() => {
    if (items.length === 0) {
      setIsSaleCompleted(false);
    }
  }, [items.length]);

  const handleCompleteSale = () => {
    if (items.length === 0 || isSaleCompleted) {
      return;
    }
    onCompleteSale(paymentMethod);
    setIsSaleCompleted(true);
  };

  const handleNewInvoice = () => {
    if (items.length > 0) {
      if (window.confirm('هل تريد مسح الفاتورة الحالية؟')) {
        onClearCart();
        setIsSaleCompleted(false);
      }
    } else {
      onClearCart();
      setIsSaleCompleted(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">الفاتورة الحالية</h2>
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {items.length} صنف
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
            <p>لا توجد منتجات في الفاتورة</p>
            <p className="text-sm">اضغط على المنتج لإضافته</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={(delta) => onQuantityChange(item.id, delta)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Price breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{invoiceService.formatCurrency(subtotal)} {POS_CONFIG.currency}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>رسوم الخدمة ({(POS_CONFIG.serviceFeePercentage * 100).toFixed(0)}%)</span>
              <span>{invoiceService.formatCurrency(serviceFee)} {POS_CONFIG.currency}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>الضريبة ({(POS_CONFIG.taxPercentage * 100).toFixed(0)}%)</span>
              <span>{invoiceService.formatCurrency(tax)} {POS_CONFIG.currency}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>الإجمالي</span>
              <span className="text-primary">{invoiceService.formatCurrency(total)} {POS_CONFIG.currency}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">طريقة الدفع</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200",
                  paymentMethod === 'cash'
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                )}
              >
                <Banknote className="w-5 h-5" />
                <span>نقدي</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200",
                  paymentMethod === 'card'
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                )}
              >
                <CreditCard className="w-5 h-5" />
                <span>بطاقة</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleCompleteSale}
              disabled={isSaleCompleted}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg shadow-soft transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]",
                isSaleCompleted
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "gradient-accent text-accent-foreground hover:shadow-glow"
              )}
            >
              <CheckCircle className="w-6 h-6" />
              <span>{isSaleCompleted ? 'تم البيع' : 'إتمام البيع'}</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleNewInvoice}
                className="py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>فاتورة جديدة</span>
              </button>
              <button
                onClick={onPrint}
                className="py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
