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

interface TopInsightCalloutProps {
  insight: Insight;
}

export function TopInsightCallout({ insight }: TopInsightCalloutProps) {
  const Icon = iconMap[insight.iconName];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3.5 text-white">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
          <Icon className="h-4 w-4 text-slate-200" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Top Insight
        </p>
        <p className="mt-0.5 text-sm font-semibold text-white">
          {insight.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
          {insight.description}
        </p>
      </div>
    </div>
  );
}
