import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { products, categories } from '@/data/products';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المنتجات</h1>
            <p className="text-muted-foreground">إضافة وتعديل المنتجات والأسعار</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 gradient-accent text-accent-foreground rounded-xl font-medium shadow-soft hover:shadow-glow transition-all duration-200">
          <Plus className="w-5 h-5" />
          <span>إضافة منتج</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="البحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-right py-4 px-6 font-semibold text-foreground">#</th>
              <th className="text-right py-4 px-6 font-semibold text-foreground">المنتج</th>
              <th className="text-right py-4 px-6 font-semibold text-foreground">التصنيف</th>
              <th className="text-right py-4 px-6 font-semibold text-foreground">السعر</th>
              <th className="text-right py-4 px-6 font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="py-4 px-6 text-muted-foreground">{index + 1}</td>
                <td className="py-4 px-6 font-medium text-foreground">{product.name}</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {getCategoryName(product.category)}
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-primary">{product.price} ر.س</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
