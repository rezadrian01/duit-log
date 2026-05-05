interface DateRangeSelectorProps {
  availableMonths: string[];
  startMonth: string;
  endMonth: string;
  onStartMonthChange: (month: string) => void;
  onEndMonthChange: (month: string) => void;
}

export function DateRangeSelector({
  availableMonths,
  startMonth,
  endMonth,
  onStartMonthChange,
  onEndMonthChange,
}: DateRangeSelectorProps) {
  // Only show end months that are >= selected start month
  const endMonthOptions = startMonth
    ? availableMonths.filter((m) => m >= startMonth)
    : availableMonths;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
        Date Range
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            From
          </p>
          <select
            value={startMonth}
            onChange={(e) => onStartMonthChange(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="">Select</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            To
          </p>
          <select
            value={endMonth}
            onChange={(e) => onEndMonthChange(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-900"
            disabled={!startMonth}
          >
            <option value="">Select</option>
            {endMonthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}
