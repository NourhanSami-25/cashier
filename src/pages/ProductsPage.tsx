import { useState, useEffect } from 'react';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductTable } from '@/components/products/ProductTable';
import { CategoryManager } from '@/components/products/CategoryManager';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/pos';
import { toast } from 'sonner';
import { Plus, Package } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    productService.initializeDefaultData();
    setProducts(productService.getAllProducts());
    setCategories(productService.getAllCategories());
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        productService.updateProduct(editingProduct.id, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        productService.addProduct(productData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      loadData();
      setEditingProduct(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    productService.deleteProduct(productId);
    toast.success('تم حذف المنتج');
    loadData();
  };

  const handleAddCategory = (name: string) => {
    try {
      productService.addCategory(name);
      toast.success('تم إضافة التصنيف');
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    productService.deleteCategory(categoryId);
    toast.success('تم حذف التصنيف');
    loadData();
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">إدارة المنتجات</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة منتج</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={handleCancelForm}
            />
          )}
          <ProductTable
            products={products}
            categories={categories}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>

        {/* Categories Section */}
        <div>
          <CategoryManager
            categories={categories}
            onAdd={handleAddCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>
    </div>
  );
}
