'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@boastitup/ui';
import { useAIInsights, useAttentionMetrics } from '../../hooks/useOKRData';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  RefreshCw,
  Sparkles,
  Eye
} from 'lucide-react';

interface InsightsColumnProps {
  brandId?: string;
  needAttentionCount: number;
  className?: string;
}

export function InsightsColumn({ brandId, needAttentionCount, className = '' }: InsightsColumnProps) {
  const { data: insights, isLoading: insightsLoading, refetch } = useAIInsights(brandId);
  const { data: attentionMetrics, isLoading: attentionLoading } = useAttentionMetrics(brandId);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return Lightbulb;
      case 'alert':
        return AlertTriangle;
      case 'opportunity':
        return TrendingUp;
      case 'trend':
        return Target;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation':
        return 'text-blue-600 bg-blue-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      case 'opportunity':
        return 'text-green-600 bg-green-50';
      case 'trend':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Insights</CardTitle>
            </div>
            <Button 
              onClick={() => refetch()} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Need Attention Metric */}
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Need Attention</h3>
                <p className="text-sm text-gray-600">OKRs requiring immediate focus</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {needAttentionCount}
            </div>
          </div>
          {needAttentionCount > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">
                {attentionMetrics?.length || 0} metrics are behind schedule or at risk
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insightsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight) => {
            const Icon = getInsightIcon(insight.insight_type);
            const colorClass = getInsightColor(insight.insight_type);
            
            return (
              <Card key={insight.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                            {insight.title}
                          </h4>
                          <Badge 
                            className={`text-xs ${getPriorityColor(insight.priority)} flex-shrink-0`}
                            variant="outline"
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {insight.description.length > 100 
                            ? `${insight.description.substring(0, 100)}...`
                            : insight.description
                          }
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span className="capitalize">{insight.insight_type}</span>
                          <span>{insight.confidence_score}% confidence</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Items */}
                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="pl-11">
                        <div className="space-y-1">
                          {insight.action_items.slice(0, 2).map((action, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span className="leading-tight">
                                {action.length > 80 ? `${action.substring(0, 80)}...` : action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {insights.length > 5 && (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600">
                  {insights.length - 5} more insights available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Insights Yet</h3>
            <p className="text-xs text-gray-600">
              AI insights will appear as your OKR data accumulates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}