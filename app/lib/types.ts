export interface ExpenseEntry {
  timestamp: string;
  item: string;
  category: string;
  amount: number;
  method: string;
  date: string;
  source: string;
}

export interface DailyTotal {
  date: string;
  month: string;
  amount: number;
}

export interface CategoryAgg {
  category: string;
  amount: number;
  count: number;
  percentage?: number;
}

export interface PaymentAgg {
  method: string;
  amount: number;
  count: number;
  percentage?: number;
}

export interface SummaryMetrics {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  topCategoryAmount: number;
  periodStart: string;
  periodEnd: string;
  previousTotalSpent?: number;
}

export interface WeeklyTotal {
  weekKey: string;
  weekLabel: string;
  amount: number;
  transactionCount: number;
}

export interface Insight {
  iconName: string;
  title: string;
  description: string;
}
