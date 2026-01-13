import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

// Mock data for demonstration
const mockStats = {
  todaySales: 2450.00,
  todayOrders: 47,
  averageOrder: 52.13,
  topProduct: 'كابتشينو',
};

const mockRecentSales = [
  { id: '001', time: '10:30', items: 3, total: 65.50, method: 'نقدي' },
  { id: '002', time: '10:45', items: 2, total: 42.00, method: 'بطاقة' },
  { id: '003', time: '11:00', items: 5, total: 98.75, method: 'نقدي' },
  { id: '004', time: '11:15', items: 1, total: 25.00, method: 'بطاقة' },
  { id: '005', time: '11:30', items: 4, total: 72.25, method: 'نقدي' },
];

const mockCategorySales = [
  { name: 'القهوة', sales: 1250, percentage: 51 },
  { name: 'الشاي', sales: 380, percentage: 15 },
  { name: 'مشروبات باردة', sales: 450, percentage: 18 },
  { name: 'الحلويات', sales: 270, percentage: 11 },
  { name: 'الطعام', sales: 100, percentage: 5 },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
            <p className="text-muted-foreground">متابعة المبيعات والأداء</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">اليوم</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <ArrowUp className="w-4 h-4" />
              <span>12%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">مبيعات اليوم</p>
          <p className="text-2xl font-bold text-foreground">{mockStats.todaySales.toFixed(2)} ر.س</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <ArrowUp className="w-4 h-4" />
              <span>8%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">عدد الطلبات</p>
          <p className="text-2xl font-bold text-foreground">{mockStats.todayOrders}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-destructive text-sm font-medium">
              <ArrowDown className="w-4 h-4" />
              <span>3%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">متوسط الطلب</p>
          <p className="text-2xl font-bold text-foreground">{mockStats.averageOrder.toFixed(2)} ر.س</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <span className="text-lg">☕</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">الأكثر مبيعاً</p>
          <p className="text-2xl font-bold text-foreground">{mockStats.topProduct}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <h3 className="font-bold text-lg text-foreground mb-4">المبيعات حسب التصنيف</h3>
          <div className="space-y-4">
            {mockCategorySales.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="text-muted-foreground">{category.sales} ر.س ({category.percentage}%)</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <h3 className="font-bold text-lg text-foreground mb-4">آخر المبيعات</h3>
          <div className="space-y-3">
            {mockRecentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{sale.id}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sale.items} أصناف</p>
                    <p className="text-sm text-muted-foreground">{sale.time}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{sale.total.toFixed(2)} ر.س</p>
                  <p className="text-sm text-muted-foreground">{sale.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
