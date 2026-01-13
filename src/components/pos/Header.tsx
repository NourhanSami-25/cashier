import { Coffee, Package, BarChart3, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { path: '/', label: 'الكاشير', icon: Coffee },
  { path: '/products', label: 'المنتجات', icon: Package },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
];

export function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-card shadow-soft border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Coffee className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Cafe POS</h1>
              <p className="text-sm text-muted-foreground">نظام الكاشير</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200",
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Time */}
          <div className="flex items-center gap-2 text-muted-foreground bg-secondary px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5" />
            <span className="font-medium tabular-nums">
              {currentTime.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
