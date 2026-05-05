import { useCallback } from 'react';
import {
  data,
  useLoaderData,
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router';
import type { Route } from './+types/analytics';
import { requireAuth } from '~/lib/auth.server';
import { isNetworkError } from '~/lib/month.server';
import { getAvailableMonths } from '~/lib/sheets.server';
import {
  getExpensesForDateRange,
  aggregateByCategory,
  aggregateByPaymentMethod,
  calculateDailyTotals,
  calculateSummaryMetrics,
  calculateWeeklyTotals,
  generateInsights,
  getPreviousPeriodTotal,
} from '~/lib/analytics.server';
import { AnalyticsDashboard } from '~/components/analytics-dashboard';
import type {
  CategoryAgg,
  DailyTotal,
  PaymentAgg,
  SummaryMetrics,
  WeeklyTotal,
  Insight,
} from '~/lib/types';

function getDefaultStartMonth(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function getDefaultEndMonth(): string {
  return getDefaultStartMonth();
}

function isValidMonthFormat(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);

  const url = new URL(request.url);
  let startMonth = url.searchParams.get('startMonth');
  let endMonth = url.searchParams.get('endMonth');

  if (!startMonth) startMonth = getDefaultStartMonth();
  if (!endMonth) endMonth = getDefaultEndMonth();

  if (
    !isValidMonthFormat(startMonth) ||
    !isValidMonthFormat(endMonth)
  ) {
    return data(
      { error: 'Invalid month format. Use YYYY-MM format.' },
      { status: 400 },
    );
  }

  if (startMonth > endMonth) {
    return data(
      { error: 'Start month must be before or equal to end month.' },
      { status: 400 },
    );
  }

  let availableMonths: string[] = [];

  try {
    availableMonths = await getAvailableMonths();
  } catch (err) {
    if (isNetworkError(err)) {
      return data(
        {
          error: 'Analytics unavailable offline',
          offline: true,
          availableMonths: [],
          selectedRange: { startMonth, endMonth },
        },
      );
    }
    throw err;
  }

  try {
    const entries = await getExpensesForDateRange(startMonth, endMonth);

    if (entries.length === 0) {
      return data({
        summaryMetrics: null,
        categoryData: [],
        paymentData: [],
        dailyData: [],
        weeklyData: [],
        insights: [],
        availableMonths,
        selectedRange: { startMonth, endMonth },
      });
    }

    const [categoryData, paymentData, dailyData, weeklyData, summaryMetrics, previousTotalSpent] =
      await Promise.all([
        aggregateByCategory(entries),
        aggregateByPaymentMethod(entries),
        calculateDailyTotals(entries),
        calculateWeeklyTotals(entries),
        calculateSummaryMetrics(entries, startMonth, endMonth),
        getPreviousPeriodTotal(startMonth, endMonth),
      ]);

    const metricsWithPrev = { ...summaryMetrics, previousTotalSpent };

    const insights = await generateInsights(entries, categoryData, paymentData);

    return data({
      summaryMetrics: metricsWithPrev,
      categoryData,
      paymentData,
      dailyData,
      weeklyData,
      insights,
      availableMonths,
      selectedRange: { startMonth, endMonth },
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return data(
        {
          error: 'Failed to load analytics data',
          offline: true,
          availableMonths,
          selectedRange: { startMonth, endMonth },
        },
      );
    }
    throw err;
  }
}

export default function Analytics() {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const error = 'error' in loaderData ? (loaderData.error as string) : null;
  const offline = 'offline' in loaderData ? (loaderData.offline as boolean) : false;
  const summaryMetrics =
    'summaryMetrics' in loaderData
      ? (loaderData.summaryMetrics as SummaryMetrics | null)
      : null;
  const categoryData =
    'categoryData' in loaderData ? (loaderData.categoryData as CategoryAgg[]) : [];
  const paymentData =
    'paymentData' in loaderData ? (loaderData.paymentData as PaymentAgg[]) : [];
  const dailyData =
    'dailyData' in loaderData ? (loaderData.dailyData as DailyTotal[]) : [];
  const weeklyData =
    'weeklyData' in loaderData ? (loaderData.weeklyData as WeeklyTotal[]) : [];
  const insights =
    'insights' in loaderData ? (loaderData.insights as Insight[]) : [];
  const availableMonths =
    'availableMonths' in loaderData
      ? (loaderData.availableMonths as string[])
      : [];
  const selectedRange =
    'selectedRange' in loaderData
      ? (loaderData.selectedRange as { startMonth: string; endMonth: string })
      : { startMonth: '', endMonth: '' };


  const handleApplyDateRange = useCallback(
    (newStartMonth: string, newEndMonth: string) => {
      if (newStartMonth && newEndMonth) {
        navigate(
          `/analytics?startMonth=${newStartMonth}&endMonth=${newEndMonth}`,
        );
      }
    },
    [navigate],
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-white">
      <header className="shrink-0 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-0.5 text-xs text-slate-400">Spending breakdown and trends</p>
      </header>

      {offline && (
        <div className="mx-4 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Analytics is unavailable offline. Connect to the internet to view insights.
        </div>
      )}

      {error && !offline && (
        <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!offline && (
        <AnalyticsDashboard
          dateRange={selectedRange}
          availableMonths={availableMonths}
          onDateRangeChange={handleApplyDateRange}
          summaryMetrics={summaryMetrics}
          categoryData={categoryData}
          paymentData={paymentData}
          dailyData={dailyData}
          weeklyData={weeklyData}
          insights={insights}
        />
      )}
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isDev =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development';
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'Something went wrong'
    : error instanceof Error
      ? isDev
        ? error.message
        : 'Something went wrong'
      : 'Something went wrong';

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-xl font-bold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
      >
        Go home
      </a>
    </main>
  );
}
