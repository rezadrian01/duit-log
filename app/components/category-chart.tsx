import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryAgg } from '~/lib/types';

interface CategoryChartProps {
  data: CategoryAgg[];
}

const categoryColors: Record<string, string> = {
  Food: '#F59E0B',
  Transport: '#3B82F6',
  Groceries: '#10B981',
  Utilities: '#8B5CF6',
  Health: '#EF4444',
  Entertainment: '#EC4899',
  Shopping: '#6366F1',
  Education: '#14B8A6',
  Other: '#64748B',
};

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('id-ID');
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-lg bg-white px-3 py-2 shadow-xl border border-slate-100">
        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="text-xs text-slate-600 mt-0.5">IDR {formatIDR(item.value)}</p>
        <p className="text-xs text-slate-400">{item.percentage?.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">No category data</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-5">
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              label={false}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColors[entry.category] || '#64748B'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2.5">
        {data.map((item) => {
          const color = categoryColors[item.category] || '#64748B';
          const pct = item.percentage ?? 0;
          return (
            <div key={item.category} className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {item.category}
                  </span>
                  <span className="ml-2 flex-shrink-0 text-xs font-semibold text-slate-500">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
              <span className="flex-shrink-0 min-w-[64px] text-right text-xs font-semibold text-slate-900">
                {formatIDRCompact(item.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
