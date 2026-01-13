import { cn } from '@/lib/utils';
import { Category } from '@/types/pos';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All Products Tab */}
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200",
          activeCategory === null
            ? "gradient-primary text-primary-foreground shadow-soft animate-scale-in"
            : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
        )}
      >
        <span className="text-lg">📋</span>
        <span>الكل</span>
      </button>
      
      {/* Category Tabs */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200",
            activeCategory === category.id
              ? "gradient-primary text-primary-foreground shadow-soft animate-scale-in"
              : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
          )}
        >
          {category.icon && <span className="text-lg">{category.icon}</span>}
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
