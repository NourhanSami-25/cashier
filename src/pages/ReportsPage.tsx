import { useState, useEffect } from 'react';
import { DatePicker } from '@/components/reports/DatePicker';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { InvoiceList } from '@/components/reports/InvoiceList';
import { reportService } from '@/services/reportService';
import { DailyReport } from '@/types/pos';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [selectedDate]);

  const loadReport = () => {
    const dailyReport = reportService.getDailyReport(selectedDate);
    setReport(dailyReport);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">تقارير المبيعات</h1>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Summary Cards */}
      {report && (
        <SummaryCards
          totalSales={report.totalSales}
          invoiceCount={report.invoiceCount}
          totalRevenue={report.totalRevenue}
        />
      )}

      {/* Invoice List */}
      {report && <InvoiceList invoices={report.invoices} />}
    </div>
  );
}
