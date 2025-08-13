"use client";

import { useAIInsights } from '../../../../../apps/web/hooks/use-ai-insights';
import { AIInsightCard, AIInsightCardSkeleton } from './ai-insight-card';
import { AIInsight } from '../../../../../apps/web/types/okr';
import { cn } from '../../lib/utils';

interface AIInsightsPanelProps {
  initialData?: AIInsight[] | null;
  error?: Error | null;
  className?: string;
}

export function AIInsightsPanel({ initialData, error: initialError, className }: AIInsightsPanelProps) {
  const { insights, isLoading, error, acknowledgeInsight } = useAIInsights();
  
  // Use hook data if available, otherwise fall back to initial data
  const data = insights || initialData;
  const currentError = error || initialError;

  if (currentError) {
    return (
      <div className={cn("w-full mt-8", className)}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 AI-Powered Insights
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load AI insights</h3>
          <p className="text-red-600">{currentError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full mt-8", className)}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🤖 AI-Powered Insights
        </h2>
        <p className="text-gray-600 mt-1">
          Intelligent recommendations based on your OKR performance data
        </p>
      </div>

      {/* Loading State */}
      {(isLoading || !data) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <AIInsightCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* No Data State */}
      {data && data.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">All insights have been reviewed</h3>
          <p className="text-gray-600 mb-4">New insights will appear here as they're generated based on your OKR performance.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Check for new insights
          </button>
        </div>
      )}

      {/* Insights Grid */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((insight, index) => (
            <AIInsightCard
              key={`${insight.insight_title}-${index}`}
              insight={insight}
              onAcknowledge={acknowledgeInsight}
            />
          ))}
        </div>
      )}
    </div>
  );
}