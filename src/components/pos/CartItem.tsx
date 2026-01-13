import { CartItem as CartItemType } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl animate-fade-in">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">
          {item.product.price} ر.س × {item.quantity}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold tabular-nums">
          {item.quantity}
        </span>
        
        <button
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-left min-w-[70px]">
        <span className="font-bold text-foreground">{itemTotal}</span>
        <span className="text-xs text-muted-foreground mr-1">ر.س</span>
      </div>
      
      <button
        onClick={() => onRemove(item.product.id)}
        className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
