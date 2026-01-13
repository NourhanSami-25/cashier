import { useState, useMemo, useEffect } from 'react';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { CartProvider, useCart } from '@/context/CartContext';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/pos';
import { toast } from 'sonner';

function CashierContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const {
    items,
    subtotal,
    serviceFee,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    completeSale,
  } = useCart();

  useEffect(() => {
    // Initialize default data and load
    productService.initializeDefaultData();
    setProducts(productService.getAllProducts());
    setCategories(productService.getAllCategories());
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === null) return products;
    return productService.getProductsByCategory(activeCategory);
  }, [activeCategory, products]);

  const handleProductClick = (product: Product) => {
    addItem(product);
    toast.success(`تمت إضافة ${product.name}`);
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    updateQuantity(itemId, delta);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.info('تم حذف الصنف');
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('تم إنشاء فاتورة جديدة');
  };

  const handleCompleteSale = (paymentMethod: 'cash' | 'card') => {
    if (items.length === 0) {
      toast.error('لا يمكن إتمام البيع بدون منتجات');
      return;
    }
    
    const invoice = completeSale(paymentMethod);
    if (invoice) {
      toast.success(`تم إتمام البيع بنجاح - ${invoice.total.toFixed(2)} ج.م`);
    }
  };

  const handlePrint = () => {
    toast.info('جاري الطباعة...');
    window.print();
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
          <ProductGrid 
            products={filteredProducts} 
            onProductClick={handleProductClick} 
          />
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] flex-shrink-0">
        <Cart
          items={items}
          subtotal={subtotal}
          serviceFee={serviceFee}
          tax={tax}
          total={total}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCompleteSale={handleCompleteSale}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
}

export default function CashierPage() {
  return (
    <CartProvider>
      <CashierContent />
    </CartProvider>
  );
}
