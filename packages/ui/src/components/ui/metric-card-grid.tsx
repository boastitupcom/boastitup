"use client";

import { useDashboardMetrics } from '../../../../../apps/web/hooks/use-dashboard-metrics';
import { MetricCard, MetricCardSkeleton } from './metric-card';
import { DashboardMetric } from '../../../../../apps/web/types/okr';
import { cn } from '../../lib/utils';

interface MetricCardGridProps {
  initialData?: DashboardMetric[] | null;
  error?: Error | null;
  className?: string;
}

export function MetricCardGrid({ initialData, error: initialError, className }: MetricCardGridProps) {
  const { metrics, isLoading, error, refresh } = useDashboardMetrics();
  
  // Use hook data if available, otherwise fall back to initial data
  const data = metrics || initialData;
  const currentError = error || initialError;

  if (currentError) {
    return (
      <div className={cn("w-full", className)}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load dashboard data</h3>
          <p className="text-red-600 mb-4">{currentError.message}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No active OKRs found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first OKR to track performance.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create your first OKR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {data.map((metric) => (
        <MetricCard
          key={metric.okr_id}
          metric={metric}
        />
      ))}
    </div>
  );
}