import React, { useState } from 'react';
import { Category } from '@/types/pos';
import { Plus, Trash2, Tag } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { productService } from '@/services/productService';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAdd(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDelete(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

  // Get product count for the category to be deleted
  const productCount = categoryToDelete 
    ? productService.getProductCountByCategory(categoryToDelete.id) 
    : 0;

  // Build confirmation message
  const confirmMessage = categoryToDelete
    ? productCount > 0
      ? `هل أنت متأكد من حذف التصنيف "${categoryToDelete.name}"؟\n\nسيتم حذف ${productCount} منتج مرتبط بهذا التصنيف.\n\nلا يمكن التراجع عن هذا الإجراء.`
      : `هل أنت متأكد من حذف التصنيف "${categoryToDelete.name}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`
    : '';

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">إدارة التصنيفات</h3>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="اسم التصنيف الجديد"
          />
          <button
            type="submit"
            className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">لا توجد تصنيفات</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <span className="font-medium text-foreground">{category.name}</span>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="تأكيد حذف التصنيف"
        message={confirmMessage}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
