import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DailyTotal } from '~/lib/types';

interface TrendChartProps {
  data: DailyTotal[];
  startMonth: string;
  endMonth: string;
}

const monthColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
  '#F97316',
  '#84CC16',
  '#06BA63',
];

function formatIDRCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
}

const axisProps = {
  tick: { fontSize: 11, fill: '#94a3b8' },
  tickLine: false,
};

// ─── Single-month bar chart ───────────────────────────────────────────────────

const SingleMonthTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white px-3 py-2.5 shadow-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-1">
          Day {payload[0].payload.day}
        </p>
        <p className="text-sm font-bold text-slate-900">
          IDR {formatIDR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

function SingleMonthBarChart({ data }: { data: DailyTotal[] }) {
  const chartData = data
    .map((entry) => {
      const [, dateDay] = entry.date.split('/');
      return { day: String(Number(dateDay)).padStart(2, '0'), amount: entry.amount };
    })
    .sort((a, b) => Number(a.day) - Number(b.day));

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="day" {...axisProps} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis
            tickFormatter={formatIDRCompact}
            {...axisProps}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<SingleMonthTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={monthColors[0]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Multi-month line chart ───────────────────────────────────────────────────

const MultiMonthTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white px-3 py-2.5 shadow-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-1.5">
          Day {payload[0].payload.day}
        </p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-600">{formatMonthLabel(entry.name)}</span>
            <span className="ml-auto pl-3 text-xs font-semibold text-slate-900">
              {formatIDR(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ data, startMonth, endMonth }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">No daily spending data</p>
      </div>
    );
  }

  const monthsInRange = getMonthsInRange(startMonth, endMonth);

  if (monthsInRange.length === 1) {
    return <SingleMonthBarChart data={data} />;
  }

  const chartData = groupByDay(data);

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              {...axisProps}
              axisLine={{ stroke: '#e2e8f0' }}
              label={{
                value: 'Day',
                position: 'insideBottomRight',
                offset: -4,
                style: { fontSize: 10, fill: '#94a3b8' },
              }}
            />
            <YAxis
              tickFormatter={formatIDRCompact}
              {...axisProps}
              axisLine={false}
              width={48}
            />
            <Tooltip content={<MultiMonthTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {formatMonthLabel(value)}
                </span>
              )}
            />
            {monthsInRange.map((month, idx) => (
              <Line
                key={month}
                type="monotone"
                dataKey={month}
                stroke={monthColors[idx % monthColors.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getMonthsInRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);

  let year = startYear;
  let month = startMonthNum;

  while (year < endYear || (year === endYear && month <= endMonthNum)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }

  return months;
}

function groupByDay(data: DailyTotal[]): Record<string, any>[] {
  const dayMap = new Map<number, Record<string, any>>();

  for (const entry of data) {
    const [dateMonth, dateDay, dateYear] = entry.date.split('/');
    const day = Number(dateDay);
    const month = `${dateYear}-${String(dateMonth).padStart(2, '0')}`;

    if (!dayMap.has(day)) {
      dayMap.set(day, { day: String(day).padStart(2, '0') });
    }

    const dayData = dayMap.get(day)!;
    dayData[month] = (dayData[month] || 0) + entry.amount;
  }

  return Array.from(dayMap.values()).sort((a, b) => Number(a.day) - Number(b.day));
}
