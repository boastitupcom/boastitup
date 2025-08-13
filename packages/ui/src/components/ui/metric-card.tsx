"use client";

import { DashboardMetric } from '../../../../../apps/web/types/okr';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  metric: DashboardMetric;
  className?: string;
}

const iconMapping = {
  revenue: '💵',
  instagram: '📷',
  tiktok: '🎵',
  customers: '👥',
  orders: '🛍️',
  repeat_purchase: '🔄'
};

const statusColors = {
  'On Track': 'bg-green-500',
  'At Risk': 'bg-red-500',
  'Behind': 'bg-yellow-500',
  'No Data': 'bg-gray-500'
};

const changeColors = {
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  gray: 'text-gray-600'
};

export function MetricCard({ metric, className }: MetricCardProps) {
  const formatNumber = (value: string | number) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatChange = (percentage: number | null, absolute: number | null) => {
    if (percentage === null && absolute === null) return '';
    
    const direction = metric.change_direction === 'up' ? '↑' : 
                     metric.change_direction === 'down' ? '↓' : '';
    
    const percentageText = percentage !== null ? `${Math.abs(percentage)}%` : '';
    const absoluteText = absolute !== null ? `(${absolute > 0 ? '+' : ''}${formatNumber(absolute)})` : '';
    
    return `${direction} ${percentageText} ${absoluteText}`.trim();
  };

  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-6", className)}>
      {/* Status color bar */}
      <div className={cn("h-1 w-full mb-4 rounded-full", statusColors[metric.card_status])} />
      
      {/* Header with icon, title, and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconMapping[metric.icon_type]}</span>
          <h3 className="font-bold text-gray-900">{metric.card_title}</h3>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-md text-xs font-medium uppercase",
          metric.status_color === 'green' && "bg-green-100 text-green-800",
          metric.status_color === 'red' && "bg-red-100 text-red-800",
          metric.status_color === 'yellow' && "bg-yellow-100 text-yellow-800",
          metric.status_color === 'gray' && "bg-gray-100 text-gray-800"
        )}>
          {metric.card_status}
        </span>
      </div>

      {/* Main value and target */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-3xl font-bold text-gray-900">
          {metric.main_value}
        </span>
        <span className="text-sm text-gray-500">
          Target: {formatNumber(metric.target_value)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Target Progress</span>
          <span>{metric.progress_percentage.toFixed(1)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(metric.progress_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Change indicator and action buttons */}
      <div className="flex items-center justify-between mt-4">
        <span className={cn(
          "text-sm font-medium",
          changeColors[metric.change_color]
        )}>
          {formatChange(metric.daily_change_percentage, metric.daily_change_absolute)}
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Analyze
          </button>
          <button className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Alert
          </button>
        </div>
      </div>

      {/* Platform name */}
      <div className="mt-2 text-xs text-gray-500">
        {metric.platform_name}
      </div>
    </div>
  );
}

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-6 animate-pulse", className)}>
      <div className="h-1 w-full mb-4 bg-gray-200 rounded-full" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>
      <div className="flex items-baseline justify-between mb-4">
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
    </div>
  );
}