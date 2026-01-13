import { CartItem as CartItemType } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (delta: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const itemTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl animate-fade-in">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{item.productName}</h4>
        <p className="text-sm text-muted-foreground">
          {invoiceService.formatCurrency(item.unitPrice)} {POS_CONFIG.currency} × {item.quantity}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(-1)}
          className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold tabular-nums">
          {item.quantity}
        </span>
        
        <button
          onClick={() => onQuantityChange(1)}
          className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-left min-w-[80px]">
        <span className="font-bold text-foreground">{invoiceService.formatCurrency(itemTotal)}</span>
        <span className="text-xs text-muted-foreground mr-1">{POS_CONFIG.currency}</span>
      </div>
      
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
