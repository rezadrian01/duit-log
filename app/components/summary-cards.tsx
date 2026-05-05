import { Wallet, BarChart3, TrendingUp, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SummaryMetrics } from '~/lib/types';

function formatIDRFull(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('id-ID');
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const prev = metrics.previousTotalSpent;
  const pctChange =
    prev != null && prev > 0
      ? ((metrics.totalSpent - prev) / prev) * 100
      : null;

  const isUp = pctChange != null && pctChange > 0;
  const isDown = pctChange != null && pctChange < 0;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Total Spent
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              IDR {formatIDRFull(metrics.totalSpent)}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-xs text-slate-400">
                {metrics.periodStart === metrics.periodEnd
                  ? formatMonth(metrics.periodStart)
                  : `${formatMonth(metrics.periodStart)} — ${formatMonth(metrics.periodEnd)}`}
              </p>
              {pctChange != null && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isUp
                      ? 'bg-red-500/20 text-red-300'
                      : isDown
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isUp ? (
                    <ArrowUp className="h-2.5 w-2.5" />
                  ) : isDown ? (
                    <ArrowDown className="h-2.5 w-2.5" />
                  ) : null}
                  {Math.abs(pctChange).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="ml-4 rounded-full bg-white/10 p-2.5 flex-shrink-0">
            <Wallet className="h-5 w-5 text-slate-200" />
          </div>
        </div>

        {pctChange != null && prev != null && (
          <p className="mt-2 border-t border-white/10 pt-2 text-[11px] text-slate-500">
            vs IDR {formatIDRFull(prev)} previous period
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Transactions
            </p>
            <BarChart3 className="h-3.5 w-3.5 text-slate-300" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {metrics.transactionCount}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">total</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Average
            </p>
            <TrendingUp className="h-3.5 w-3.5 text-slate-300" />
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">
            {formatIDRCompact(metrics.averageTransaction)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">per transaction</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Top
            </p>
            <Crown className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900 truncate leading-tight">
            {metrics.topCategory}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 truncate">
            {formatIDRCompact(metrics.topCategoryAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
