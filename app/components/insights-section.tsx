import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Zap,
  Heart,
  Music,
  ShoppingBag,
  BookOpen,
  MoreHorizontal,
  CreditCard,
  AlertCircle,
  Calendar,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Insight } from '~/lib/types';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Zap,
  Heart,
  Music,
  ShoppingBag,
  BookOpen,
  MoreHorizontal,
  CreditCard,
  AlertCircle,
  Calendar,
  BarChart3,
  TrendingUp,
};

const iconBgMap: Record<string, string> = {
  UtensilsCrossed: 'bg-amber-100 text-amber-600',
  Car: 'bg-blue-100 text-blue-600',
  ShoppingCart: 'bg-green-100 text-green-600',
  Zap: 'bg-purple-100 text-purple-600',
  Heart: 'bg-red-100 text-red-600',
  Music: 'bg-pink-100 text-pink-600',
  ShoppingBag: 'bg-indigo-100 text-indigo-600',
  BookOpen: 'bg-teal-100 text-teal-600',
  MoreHorizontal: 'bg-slate-100 text-slate-500',
  CreditCard: 'bg-blue-100 text-blue-600',
  AlertCircle: 'bg-orange-100 text-orange-600',
  Calendar: 'bg-violet-100 text-violet-600',
  BarChart3: 'bg-sky-100 text-sky-600',
  TrendingUp: 'bg-emerald-100 text-emerald-600',
};

interface InsightsSectionProps {
  insights: Insight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">No insights available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight, idx) => {
        const Icon = iconMap[insight.iconName];
        const iconStyle = iconBgMap[insight.iconName] || 'bg-slate-100 text-slate-500';
        return (
          <div
            key={idx}
            className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            {Icon && (
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${iconStyle}`}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {insight.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {insight.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
