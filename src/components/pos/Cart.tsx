import { CartItem as CartItemType, PaymentMethod } from '@/types/pos';
import { CartItem } from './CartItem';
import { ShoppingCart, CreditCard, Banknote, RotateCcw, Printer, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartProps {
  items: CartItemType[];
  paymentMethod: PaymentMethod;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onNewInvoice: () => void;
  onComplete: () => void;
}

const SERVICE_RATE = 0.10; // 10%
const TAX_RATE = 0.15; // 15%

export function Cart({
  items,
  paymentMethod,
  onUpdateQuantity,
  onRemoveItem,
  onPaymentMethodChange,
  onNewInvoice,
  onComplete,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceCharge = subtotal * SERVICE_RATE;
  const taxableAmount = subtotal + serviceCharge;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

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
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
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
              <span>{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>رسوم الخدمة (10%)</span>
              <span>{serviceCharge.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>الضريبة (15%)</span>
              <span>{tax.toFixed(2)} ر.س</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">طريقة الدفع</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPaymentMethodChange('cash')}
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
                onClick={() => onPaymentMethodChange('card')}
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
              onClick={onComplete}
              className="w-full py-4 gradient-accent text-accent-foreground rounded-xl font-bold text-lg shadow-soft hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle className="w-6 h-6" />
              <span>إتمام البيع</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onNewInvoice}
                className="py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>فاتورة جديدة</span>
              </button>
              <button
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
