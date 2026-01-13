import { Product } from '@/types/pos';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg">لا توجد منتجات في هذا التصنيف</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAddToCart}
        />
      ))}
    </div>
  );
}
