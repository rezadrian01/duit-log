import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { WeeklyTotal } from '~/lib/types';

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('id-ID');
}

const WeekTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as WeeklyTotal;
    return (
      <div className="rounded-lg bg-white px-3 py-2.5 shadow-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-700">{d.weekLabel}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">
          IDR {formatIDR(d.amount)}
        </p>
        <p className="text-xs text-slate-400">
          {d.transactionCount} transaction{d.transactionCount !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

interface WeeklyReportProps {
  data: WeeklyTotal[];
}

export function WeeklyReport({ data }: WeeklyReportProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">No weekly data</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((w) => w.amount));
  const minAmount = Math.min(...data.map((w) => w.amount));
  const weeklyAvg = Math.round(data.reduce((s, w) => s + w.amount, 0) / data.length);

  // Short label for X axis: "Jan 6" (just the Monday date)
  const chartData = data.map((w) => ({
    ...w,
    shortLabel: w.weekLabel.split(' – ')[0],
  }));

  // Minimum bar width of 56px so it's always readable on small screens
  const chartWidth = Math.max(data.length * 56, 300);

  return (
    <div className="space-y-4">
      {/* Weekly average stat */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-xs font-medium text-slate-500">Weekly average</span>
        <span className="text-sm font-bold text-slate-900">
          IDR {formatIDR(weeklyAvg)}
        </span>
      </div>

      {/* Bar chart */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${chartWidth}px`, height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tickFormatter={formatIDRCompact}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<WeekTooltip />} cursor={{ fill: '#f8fafc' }} />
              <ReferenceLine
                y={weeklyAvg}
                stroke="#94a3b8"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: `Avg ${formatIDRCompact(weeklyAvg)}`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.amount === maxAmount ? '#0f172a' : '#3B82F6'}
                    fillOpacity={entry.amount === maxAmount ? 1 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Week-by-week list */}
      <div className="space-y-2">
        {data.map((week, idx) => {
          const prev = data[idx - 1];
          const pct =
            prev && prev.amount > 0
              ? ((week.amount - prev.amount) / prev.amount) * 100
              : null;
          const isUp = pct != null && pct > 0;
          const isDown = pct != null && pct < 0;
          const isHighest = week.amount === maxAmount;
          const isLowest = data.length > 1 && week.amount === minAmount;
          const vsAvgPct = ((week.amount - weeklyAvg) / weeklyAvg) * 100;
          const aboveAvg = vsAvgPct > 0;
          const belowAvg = vsAvgPct < 0;

          return (
            <div
              key={week.weekKey}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isHighest
                  ? 'border-slate-300 bg-slate-900 text-white'
                  : 'border-slate-100 bg-white'
              }`}
            >
              {/* Week number */}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isHighest
                    ? 'bg-white/15 text-slate-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {idx + 1}
              </div>

              {/* Week label + count */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p
                    className={`text-xs font-semibold ${
                      isHighest ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {week.weekLabel}
                  </p>
                  {isHighest && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-200">
                      highest
                    </span>
                  )}
                  {isLowest && (
                    <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                      lowest
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isHighest ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {week.transactionCount} transaction{week.transactionCount !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Amount + WoW delta */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={`text-sm font-bold ${
                    isHighest ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  IDR {formatIDRCompact(week.amount)}
                </p>
                {pct != null ? (
                  <div
                    className={`mt-0.5 flex items-center justify-end gap-0.5 text-[11px] font-medium ${
                      isHighest
                        ? isUp ? 'text-red-300' : 'text-green-300'
                        : isUp ? 'text-red-500' : isDown ? 'text-green-500' : 'text-slate-400'
                    }`}
                  >
                    {isUp ? <ArrowUp className="h-2.5 w-2.5" /> : isDown ? <ArrowDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                    {Math.abs(pct).toFixed(0)}% vs prev
                  </div>
                ) : (
                  <p className={`mt-0.5 text-[11px] ${isHighest ? 'text-slate-500' : 'text-slate-300'}`}>
                    first week
                  </p>
                )}
                {data.length > 1 && (
                  <p className={`mt-0.5 text-[10px] ${
                    isHighest
                      ? aboveAvg ? 'text-red-300' : 'text-green-300'
                      : aboveAvg ? 'text-red-400' : belowAvg ? 'text-green-500' : 'text-slate-400'
                  }`}>
                    {aboveAvg ? '+' : ''}{vsAvgPct.toFixed(0)}% vs avg
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
