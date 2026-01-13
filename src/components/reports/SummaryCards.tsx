import { DollarSign, FileText, TrendingUp } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { POS_CONFIG } from '@/config/pos.config';

interface SummaryCardsProps {
  totalSales: number;
  invoiceCount: number;
  totalRevenue: number;
}

export function SummaryCards({ totalSales, invoiceCount, totalRevenue }: SummaryCardsProps) {
  const cards = [
    {
      title: 'إجمالي المبيعات',
      value: `${invoiceService.formatCurrency(totalSales)} ${POS_CONFIG.currency}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'عدد الفواتير',
      value: invoiceCount.toString(),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'إجمالي الدخل',
      value: `${invoiceService.formatCurrency(totalRevenue)} ${POS_CONFIG.currency}`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-xl border border-border p-6 flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${card.bgColor}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
