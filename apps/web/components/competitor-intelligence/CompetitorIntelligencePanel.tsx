// apps/web/components/competitor-intelligence/CompetitorIntelligencePanel.tsx
"use client";

import React from 'react';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@boastitup/ui';
import type { CompetitorIntelligence } from '@boastitup/types';
import { calculateAggregatedMetrics } from '@boastitup/hooks/src/competitor-intelligence';

interface CompetitorIntelligencePanelProps {
  competitors: CompetitorIntelligence[];
  isLoading: boolean;
  onCompetitorSelect?: (competitor: CompetitorIntelligence) => void;
  className?: string;
}

const CompetitorIntelligenceSkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-6 bg-purple-200 rounded w-32"></div>
      <div className="h-5 bg-purple-100 rounded w-16"></div>
    </div>
    
    {/* Budget Insights Section */}
    <div className="space-y-3 mb-4">
      <div className="bg-purple-100 rounded p-3">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
          <div className="h-4 bg-purple-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-purple-200 rounded w-16"></div>
      </div>
      
      <div className="bg-purple-100 rounded p-3">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
          <div className="h-4 bg-purple-200 rounded w-32"></div>
        </div>
        <div className="h-4 bg-purple-200 rounded w-full"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-purple-100 rounded p-3">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
          <div className="h-4 bg-purple-200 rounded w-28"></div>
        </div>
        <div className="h-4 bg-purple-200 rounded w-20"></div>
      </div>
      
      <div className="bg-purple-100 rounded p-3">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
          <div className="h-4 bg-purple-200 rounded w-32"></div>
        </div>
        <div className="h-4 bg-purple-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const EmptyCompetitorIntelligenceState = () => (
  <div className="text-center py-6">
    <Target className="w-8 h-8 text-purple-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500 mb-1">No competitor data available</p>
    <p className="text-xs text-gray-400">Add competitors to see insights</p>
  </div>
);

const InsightCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  content: string | React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}> = ({ icon, title, content, trend }) => (
  <div className="bg-white bg-opacity-50 rounded p-3 border border-purple-100">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        {icon}
        <span className="text-sm font-medium text-gray-700 ml-2">{title}</span>
      </div>
      {trend && (
        <div className="flex items-center">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          {trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
        </div>
      )}
    </div>
    <div className="text-gray-800">
      {typeof content === 'string' ? (
        <p className="text-sm">{content}</p>
      ) : (
        content
      )}
    </div>
  </div>
);

export const CompetitorIntelligencePanel: React.FC<CompetitorIntelligencePanelProps> = ({
  competitors,
  isLoading,
  onCompetitorSelect,
  className = ""
}) => {
  const aggregatedMetrics = React.useMemo(() => 
    calculateAggregatedMetrics(competitors), [competitors]);

  if (isLoading) {
    return (
      <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold mb-3 flex items-center text-gray-900">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Competitor Intelligence
        </h3>
        <CompetitorIntelligenceSkeletonLoader />
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold mb-3 flex items-center text-gray-900">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Competitor Intelligence
        </h3>
        <EmptyCompetitorIntelligenceState />
      </div>
    );
  }

  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center text-gray-900">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Competitor Intelligence
        </h3>
      </div>

      {/* Scrollable Competitor Cards */}
      <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        <div className="flex space-x-4 min-w-max">
          {competitors.map((competitor, index) => (
            <div
              key={competitor.id}
              className="flex-shrink-0 bg-white rounded-lg p-4 border border-purple-200 min-w-[280px] cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCompetitorSelect?.(competitor)}
            >
              {/* Competitor Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 truncate">
                  {competitor.competitor_name}
                </h4>
              </div>

              {/* Budget & Content Row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-purple-50 rounded p-2">
                  <div className="flex items-center mb-1">
                    <span className="text-purple-600 text-sm mr-1">$</span>
                    <span className="text-xs font-medium text-gray-700">BUDGET INSIGHTS</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {competitor.avg_spend_display}
                  </div>
                  <div className="text-xs text-gray-600">
                    {competitor.content_insight?.includes('polls') ? 'Interactive polls' : 
                     competitor.content_insight?.includes('Video') ? 'Video content' :
                     competitor.content_insight?.includes('Story') ? 'Story highlights' :
                     'Interactive content'}
                    {competitor.avg_engagement_rate && ` (+${Math.round(competitor.avg_engagement_rate * 100)}% engagement)`}
                  </div>
                </div>

                <div className="bg-purple-50 rounded p-2">
                  <div className="flex items-center mb-1">
                    <span className="text-purple-600 text-sm mr-1">▶</span>
                    <span className="text-xs font-medium text-gray-700">CONTENT STRATEGY</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {competitor.content_insight?.includes('Video') ? 'Video content' :
                     competitor.content_insight?.includes('Story') ? 'Story highlights' :
                     competitor.content_insight?.includes('polls') ? 'Interactive polls' :
                     competitor.top_content || 'Mixed content'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {competitor.content_insight?.includes('32%') ? '(+32% engagement)' :
                     competitor.content_insight?.includes('28%') ? '(+28% engagement)' :
                     competitor.content_insight?.includes('45%') ? '(+45% engagement)' :
                     '(+25% engagement)'}
                  </div>
                </div>
              </div>

              {/* Hashtag & Timing Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded p-2">
                  <div className="flex items-center mb-1">
                    <span className="text-purple-600 text-sm mr-1">#</span>
                    <span className="text-xs font-medium text-gray-700">HASHTAG STRATEGY</span>
                  </div>
                  <div className="text-sm font-medium text-purple-700">
                    {competitor.hashtags_insight || 
                     (index === 0 ? '#EcoFashion' : 
                      index === 1 ? '#SustainableStyle' : '#GreenLiving')}
                  </div>
                </div>

                <div className="bg-purple-50 rounded p-2">
                  <div className="flex items-center mb-1">
                    <span className="text-purple-600 text-sm mr-1">⏰</span>
                    <span className="text-xs font-medium text-gray-700">TIMING & ENGAGEMENT</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {competitor.timing_insight || 
                     (index === 0 ? '6-8 PM weekdays' : 
                      index === 1 ? '7-9 PM weekends' : '12-2 PM weekdays')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Tracking {competitors.length} competitors
          </span>
          <span className="text-purple-600 font-medium">
            {aggregatedMetrics.total_active_campaigns} active campaigns
          </span>
        </div>
        {aggregatedMetrics.last_updated && (
          <div className="mt-2 text-xs text-gray-500">
            Updated {new Date(aggregatedMetrics.last_updated).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
};