import { Product } from '@/types/pos';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <button
      onClick={() => onAdd(product)}
      className="group bg-card rounded-2xl p-4 border border-border shadow-soft hover:shadow-lg hover:border-primary/30 transition-all duration-200 text-right animate-fade-in active:scale-95"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:gradient-accent group-hover:text-accent-foreground transition-all duration-200">
          <Plus className="w-5 h-5" />
        </div>
        <div className="flex-1 mr-3">
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {product.name}
          </h3>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <span className="text-2xl font-bold text-primary">
          {product.price}
        </span>
        <span className="text-sm text-muted-foreground mr-1">ر.س</span>
      </div>
    </button>
  );
}
