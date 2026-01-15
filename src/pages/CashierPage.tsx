import { useState, useMemo, useEffect } from 'react';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { CartProvider, useCart } from '@/context/CartContext';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/pos';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function CashierContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
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
    let filtered = activeCategory === null 
      ? products 
      : productService.getProductsByCategory(activeCategory);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeCategory, products, searchQuery]);

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
    if (items.length === 0) {
      toast.error('لا يمكن الطباعة بدون منتجات');
      return;
    }

    // Create invoice HTML for printing
    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            padding: 20px;
            background: white;
          }
          .invoice {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .header h1 {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
          }
          .info-item {
            padding: 10px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .info-item label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .info-item span {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: right;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .totals {
            margin-top: 20px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.final {
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>Cashier POS</h1>
            <p>فاتورة ضريبية</p>
          </div>
          
          <div class="info">
            <div class="info-item">
              <label>التاريخ</label>
              <span>${new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            <div class="info-item">
              <label>الوقت</label>
              <span>${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th style="text-align: center;">الكمية</th>
                <th style="text-align: center;">السعر</th>
                <th style="text-align: left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: center;">${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: left;">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>المجموع الفرعي</span>
              <span>${subtotal.toFixed(2)} EGP</span>
            </div>
            <div class="total-row">
              <span>رسوم الخدمة (10%)</span>
              <span>${serviceFee.toFixed(2)} EGP</span>
            </div>
            <div class="total-row">
              <span>الضريبة (14%)</span>
              <span>${tax.toFixed(2)} EGP</span>
            </div>
            <div class="total-row final">
              <span>الإجمالي النهائي</span>
              <span>${total.toFixed(2)} EGP</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('فشل فتح نافذة الطباعة');
      return;
    }

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    toast.info('جاري الطباعة...');
  };

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4 p-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 text-lg"
          />
        </div>
        
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
