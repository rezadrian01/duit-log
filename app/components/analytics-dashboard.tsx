import type { SummaryMetrics, CategoryAgg, PaymentAgg, DailyTotal, WeeklyTotal, Insight } from '~/lib/types';
import { SummaryCards } from './summary-cards';
import { DateRangeSelector } from './analytics-date-range';
import { CategoryChart } from './category-chart';
import { PaymentMethodChart } from './payment-method-chart';
import { TrendChart } from './trend-chart';
import { WeeklyReport } from './weekly-report';
import { InsightsSection } from './insights-section';
import { TopInsightCallout } from './top-insight-callout';

interface AnalyticsDashboardProps {
  dateRange: { startMonth: string; endMonth: string };
  availableMonths: string[];
  onDateRangeChange: (startMonth: string, endMonth: string) => void;
  summaryMetrics: SummaryMetrics | null;
  categoryData: CategoryAgg[];
  paymentData: PaymentAgg[];
  dailyData: DailyTotal[];
  weeklyData: WeeklyTotal[];
  insights: Insight[];
}

export function AnalyticsDashboard({
  dateRange,
  availableMonths,
  onDateRangeChange,
  summaryMetrics,
  categoryData,
  paymentData,
  dailyData,
  weeklyData,
  insights,
}: AnalyticsDashboardProps) {
  const handleStartMonthChange = (month: string) => {
    const safeEnd =
      dateRange.endMonth && dateRange.endMonth >= month
        ? dateRange.endMonth
        : month;
    onDateRangeChange(month, safeEnd);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
      <DateRangeSelector
        availableMonths={availableMonths}
        startMonth={dateRange.startMonth}
        endMonth={dateRange.endMonth}
        onStartMonthChange={handleStartMonthChange}
        onEndMonthChange={(month) => onDateRangeChange(dateRange.startMonth, month)}
      />

      {!summaryMetrics ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="3" x2="3" y2="20" />
              <line x1="21" y1="3" x2="21" y2="20" />
              <line x1="9" y1="20" x2="9" y2="10" />
              <line x1="15" y1="20" x2="15" y2="4" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700">
              No data for this period
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try selecting a different date range.
            </p>
          </div>
        </div>
      ) : (
        <>
          <SummaryCards metrics={summaryMetrics} />

          {insights.length > 0 && (
            <TopInsightCallout insight={insights[0]} />
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <SectionHeader title="By Category" />
              <CategoryChart data={categoryData} />
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <SectionHeader title="Payment Methods" />
              <PaymentMethodChart data={paymentData} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <SectionHeader title="Daily Spending" />
            <TrendChart
              data={dailyData}
              startMonth={dateRange.startMonth}
              endMonth={dateRange.endMonth}
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <SectionHeader title="Weekly Breakdown" />
            <WeeklyReport data={weeklyData} />
          </div>

          {insights.length > 1 && (
            <div>
              <SectionHeader title="Insights" className="mb-3" />
              <InsightsSection insights={insights.slice(1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  className = 'mb-4',
}: {
  title: string;
  className?: string;
}) {
  return (
    <h3 className={`text-xs font-semibold uppercase tracking-widest text-slate-400 ${className}`}>
      {title}
    </h3>
  );
}
