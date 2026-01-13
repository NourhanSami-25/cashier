import React, { useState, useEffect } from 'react';
import { Product, Category, ValidationResult } from '@/types/pos';
import { productService } from '@/services/productService';
import { X, Save } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSave: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setCategoryId(product.categoryId);
    } else {
      setName('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
    }
    setErrors({});
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      categoryId,
    };

    const validation = productService.validateProduct(productData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(productData);
    setName('');
    setPrice('');
    setCategoryId(categories[0]?.id || '');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h3 className="font-bold text-lg text-foreground">
        {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
      </h3>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">اسم المنتج</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="أدخل اسم المنتج"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">السعر</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="أدخل السعر"
        />
        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">التصنيف</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">اختر التصنيف</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 gradient-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>حفظ</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>إلغاء</span>
        </button>
      </div>
    </form>
  );
}
