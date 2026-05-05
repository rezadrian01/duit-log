import { getExpensesByMonth } from './sheets.server';
import type {
  ExpenseEntry,
  DailyTotal,
  CategoryAgg,
  PaymentAgg,
  SummaryMetrics,
  WeeklyTotal,
  Insight,
} from './types';
const categoryIconNames: Record<string, string> = {
  Food: 'UtensilsCrossed',
  Transport: 'Car',
  Groceries: 'ShoppingCart',
  Utilities: 'Zap',
  Health: 'Heart',
  Entertainment: 'Music',
  Shopping: 'ShoppingBag',
  Education: 'BookOpen',
  Other: 'MoreHorizontal',
};

function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);

  let year = startYear;
  let month = startMonthNum;

  while (year < endYear || (year === endYear && month <= endMonthNum)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months;
}

export async function getExpensesForDateRange(
  startMonth: string,
  endMonth: string,
): Promise<ExpenseEntry[]> {
  const months = generateMonthRange(startMonth, endMonth);
  const allEntries: ExpenseEntry[] = [];

  for (const month of months) {
    try {
      const rows = await getExpensesByMonth(month);
      const entries = rows.map((row) => ({
        timestamp: row[0] ?? '',
        item: row[1] ?? '',
        category: row[2] ?? '',
        amount: Number(row[3]) || 0,
        method: row[4] ?? '',
        date: row[5] ?? '',
        source: row[6] ?? '',
      }));
      allEntries.push(...entries);
    } catch {
      // Skip months that fail to load
      continue;
    }
  }

  return allEntries;
}

export async function aggregateByCategory(
  entries: ExpenseEntry[],
): Promise<CategoryAgg[]> {
  const map = new Map<string, { amount: number; count: number }>();

  for (const entry of entries) {
    const existing = map.get(entry.category) || { amount: 0, count: 0 };
    map.set(entry.category, {
      amount: existing.amount + entry.amount,
      count: existing.count + 1,
    });
  }

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const result = Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

export async function aggregateByPaymentMethod(
  entries: ExpenseEntry[],
): Promise<PaymentAgg[]> {
  const map = new Map<string, { amount: number; count: number }>();

  for (const entry of entries) {
    const existing = map.get(entry.method) || { amount: 0, count: 0 };
    map.set(entry.method, {
      amount: existing.amount + entry.amount,
      count: existing.count + 1,
    });
  }

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const result = Array.from(map.entries())
    .map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

export async function calculateDailyTotals(
  entries: ExpenseEntry[],
): Promise<DailyTotal[]> {
  const map = new Map<string, { amount: number; month: string }>();

  for (const entry of entries) {
    const existing = map.get(entry.date) || {
      amount: 0,
      month: entry.date.split('/').reverse().join('-'),
    };
    const month = `${entry.date.split('/')[2]}-${String(entry.date.split('/')[0]).padStart(2, '0')}`;
    map.set(entry.date, {
      amount: existing.amount + entry.amount,
      month,
    });
  }

  const result = Array.from(map.entries())
    .map(([date, data]) => ({
      date,
      month: data.month,
      amount: data.amount,
    }))
    .sort((a, b) => {
      const aDate = new Date(a.date.split('/').reverse().join('-'));
      const bDate = new Date(b.date.split('/').reverse().join('-'));
      return aDate.getTime() - bDate.getTime();
    });

  return result;
}

export async function calculateSummaryMetrics(
  entries: ExpenseEntry[],
  startMonth: string,
  endMonth: string,
): Promise<SummaryMetrics> {
  const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = entries.length;
  const averageTransaction =
    transactionCount > 0 ? Math.round(totalSpent / transactionCount) : 0;

  const categoryMap = new Map<string, number>();
  for (const entry of entries) {
    const existing = categoryMap.get(entry.category) || 0;
    categoryMap.set(entry.category, existing + entry.amount);
  }

  const topCategoryEntry = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topCategory = topCategoryEntry?.[0] || 'N/A';
  const topCategoryAmount = topCategoryEntry?.[1] || 0;

  return {
    totalSpent,
    transactionCount,
    averageTransaction,
    topCategory,
    topCategoryAmount,
    periodStart: startMonth,
    periodEnd: endMonth,
  };
}

function getPreviousPeriod(
  startMonth: string,
  endMonth: string,
): { prevStart: string; prevEnd: string } {
  const [sy, sm] = startMonth.split('-').map(Number);
  const [ey, em] = endMonth.split('-').map(Number);
  const rangeMonths = (ey - sy) * 12 + (em - sm) + 1;

  let pey = sy;
  let pem = sm - 1;
  if (pem < 1) { pem = 12; pey--; }

  let psy = pey;
  let psm = pem - rangeMonths + 1;
  while (psm < 1) { psm += 12; psy--; }

  return {
    prevStart: `${psy}-${String(psm).padStart(2, '0')}`,
    prevEnd: `${pey}-${String(pem).padStart(2, '0')}`,
  };
}

export async function getPreviousPeriodTotal(
  startMonth: string,
  endMonth: string,
): Promise<number> {
  const { prevStart, prevEnd } = getPreviousPeriod(startMonth, endMonth);
  try {
    const entries = await getExpensesForDateRange(prevStart, prevEnd);
    return entries.reduce((sum, e) => sum + e.amount, 0);
  } catch {
    return 0;
  }
}

export async function calculateWeeklyTotals(
  entries: ExpenseEntry[],
): Promise<WeeklyTotal[]> {
  const weekMap = new Map<string, { amount: number; count: number; weekStart: Date }>();
  const labelFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  for (const entry of entries) {
    if (!entry.date) continue;
    const parts = entry.date.split('/').map(Number);
    if (parts.length !== 3) continue;
    const [month, day, year] = parts;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) continue;

    // Monday of this ISO week (Mon=0 … Sun=6)
    const dayOfWeek = (date.getDay() + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);

    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

    const existing = weekMap.get(weekKey) ?? { amount: 0, count: 0, weekStart: monday };
    weekMap.set(weekKey, {
      amount: existing.amount + entry.amount,
      count: existing.count + 1,
      weekStart: existing.weekStart,
    });
  }

  return Array.from(weekMap.entries())
    .map(([weekKey, d]) => {
      const weekEnd = new Date(d.weekStart);
      weekEnd.setDate(d.weekStart.getDate() + 6);
      return {
        weekKey,
        weekLabel: `${labelFmt.format(d.weekStart)} – ${labelFmt.format(weekEnd)}`,
        amount: d.amount,
        transactionCount: d.count,
      };
    })
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

export async function generateInsights(
  entries: ExpenseEntry[],
  categoryData: CategoryAgg[],
  paymentData: PaymentAgg[],
): Promise<Insight[]> {
  const insights: Insight[] = [];

  if (categoryData.length === 0 || entries.length === 0) {
    return insights;
  }

  const topCategory = categoryData[0];
  if (topCategory) {
    insights.push({
      iconName: categoryIconNames[topCategory.category] || 'MoreHorizontal',
      title: `Top Spending: ${topCategory.category}`,
      description: `You spent IDR ${topCategory.amount.toLocaleString('id-ID')} on ${topCategory.category} (${topCategory.percentage?.toFixed(1)}% of total) with ${topCategory.count} transactions.`,
    });
  }

  const topPaymentMethod = paymentData[0];
  if (topPaymentMethod) {
    insights.push({
      iconName: 'CreditCard',
      title: `Preferred Payment: ${topPaymentMethod.method}`,
      description: `${topPaymentMethod.method} was used ${topPaymentMethod.count} times (${topPaymentMethod.percentage?.toFixed(1)}% of transactions).`,
    });
  }

  const highest = entries.reduce((max, e) => (e.amount > max.amount ? e : max));
  if (highest) {
    insights.push({
      iconName: 'AlertCircle',
      title: 'Highest Transaction',
      description: `${highest.item} in ${highest.category} category - IDR ${highest.amount.toLocaleString('id-ID')} on ${highest.date}`,
    });
  }

  const dailyTotals = new Map<string, number>();
  for (const entry of entries) {
    const existing = dailyTotals.get(entry.date) || 0;
    dailyTotals.set(entry.date, existing + entry.amount);
  }

  const averageDaily = Math.round(
    Array.from(dailyTotals.values()).reduce((a, b) => a + b, 0) /
      dailyTotals.size,
  );
  insights.push({
    iconName: 'BarChart3',
    title: 'Daily Average',
    description: `Your average daily spending is IDR ${averageDaily.toLocaleString('id-ID')}.`,
  });

  const dayOfWeekMap = new Map<string, number>();
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  for (const entry of entries) {
    const [month, day, year] = entry.date.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = dayNames[date.getDay()];
    const existing = dayOfWeekMap.get(dayName) || 0;
    dayOfWeekMap.set(dayName, existing + 1);
  }

  const busiestDay = Array.from(dayOfWeekMap.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (busiestDay) {
    insights.push({
      iconName: 'Calendar',
      title: 'Busiest Day',
      description: `${busiestDay[0]} is your busiest spending day with ${busiestDay[1]} transactions.`,
    });
  }

  if (categoryData.length > 1) {
    const secondCategory = categoryData[1];
    const difference = topCategory.amount - secondCategory.amount;
    const diffPercent = ((difference / topCategory.amount) * 100).toFixed(1);
    insights.push({
      iconName: 'TrendingUp',
      title: `${topCategory.category} vs ${secondCategory.category}`,
      description: `${topCategory.category} spending exceeds ${secondCategory.category} by IDR ${difference.toLocaleString('id-ID')} (${diffPercent}% more).`,
    });
  }

  return insights;
}
