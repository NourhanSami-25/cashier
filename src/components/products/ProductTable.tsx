import { useState } from 'react';
import { Product, Category } from '@/types/pos';
import { Edit, Trash2 } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductTable({ products, categories, onEdit, onDelete }: ProductTableProps) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'غير محدد';
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
  };

  if (products.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
        <p>لا توجد منتجات</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground">اسم المنتج</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground">السعر</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground">التصنيف</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 text-foreground font-medium">{product.name}</td>
                <td className="px-4 py-3 text-foreground">
                  {invoiceService.formatCurrency(product.price)} {POS_CONFIG.currency}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{getCategoryName(product.categoryId)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المنتج "${productToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
