"use client";

import { AIInsight } from '../../../../../apps/web/types/okr';
import { cn } from '../../lib/utils';

interface AIInsightCardProps {
  insight: AIInsight;
  onAcknowledge?: (insightTitle: string) => void;
  className?: string;
}

const priorityColors = {
  red: 'bg-red-100 text-red-800 border-red-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200'
};

export function AIInsightCard({ insight, onAcknowledge, className }: AIInsightCardProps) {
  const parseRecommendedActions = (actions: any): string[] => {
    // Handle null or undefined
    if (!actions) return [];
    
    // If it's an array of objects with 'action' property, extract the action text
    if (Array.isArray(actions)) {
      return actions.map(item => {
        if (typeof item === 'object' && item.action) {
          return item.action;
        }
        return String(item);
      });
    }
    
    // If it's a string, try to parse it
    if (typeof actions === 'string') {
      try {
        const parsed = JSON.parse(actions);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'object' && item.action) {
              return item.action;
            }
            return String(item);
          });
        }
        return [String(parsed)];
      } catch {
        // If JSON parsing fails, try to split by newlines or bullets
        return actions.split(/\n|•|\*/).filter(action => action.trim().length > 0);
      }
    }
    
    // Fallback: convert to string and return as single item
    return [String(actions)];
  };

  const actions = parseRecommendedActions(insight.recommended_actions);

  const renderImpactBar = (score: number) => {
    const filledBars = Math.floor(score);
    const totalBars = 10;
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 mr-2">Impact:</span>
        <div className="flex gap-1">
          {Array.from({ length: totalBars }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-sm",
                index < filledBars ? "bg-orange-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-2">{score}/10</span>
      </div>
    );
  };

  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-6", className)}>
      {/* Priority and Confidence badges */}
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          "px-3 py-1 rounded-md text-xs font-bold border",
          priorityColors[insight.priority_color]
        )}>
          {insight.priority_display}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          {insight.confidence_display}
        </span>
      </div>

      {/* Insight Title */}
      <h3 className="font-bold text-gray-900 mb-3 text-lg">
        {insight.insight_title}
      </h3>

      {/* Insight Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {insight.insight_description}
      </p>

      {/* Impact Score Visualization */}
      <div className="mb-4">
        {renderImpactBar(insight.impact_score)}
      </div>

      {/* Recommended Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800">Recommended Actions:</h4>
        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-500 mt-1">•</span>
              <span>{String(action).trim()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Acknowledge Button */}
      {onAcknowledge && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onAcknowledge(insight.insight_title)}
            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Mark as Reviewed
          </button>
        </div>
      )}
    </div>
  );
}

export function AIInsightCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-6 animate-pulse", className)}>
      {/* Priority and Confidence badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>

      {/* Title */}
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>

      {/* Impact bar */}
      <div className="flex items-center gap-1 mb-4">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="w-2 h-2 bg-gray-200 rounded-sm" />
          ))}
        </div>
        <div className="h-4 w-8 bg-gray-200 rounded" />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-4/5 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-8 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}