import { useState, useMemo } from 'react';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { categories, products } from '@/data/products';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import { toast } from 'sonner';

export default function CashierPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`تمت إضافة ${product.name}`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info('تم حذف الصنف');
  };

  const handleNewInvoice = () => {
    setCartItems([]);
    setPaymentMethod('cash');
    toast.info('تم إنشاء فاتورة جديدة');
  };

  const handleComplete = () => {
    if (cartItems.length === 0) {
      toast.error('الفاتورة فارغة');
      return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalWithCharges = total * 1.10 * 1.15;
    
    toast.success(`تم إتمام البيع بنجاح - ${totalWithCharges.toFixed(2)} ر.س`);
    setCartItems([]);
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 p-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <div className="flex-1 overflow-y-auto">
          <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] flex-shrink-0">
        <Cart
          items={cartItems}
          paymentMethod={paymentMethod}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onPaymentMethodChange={setPaymentMethod}
          onNewInvoice={handleNewInvoice}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
