'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@boastitup/ui';
import { useAIInsights } from '../../hooks/useOKRData';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  RefreshCw,
  Sparkles 
} from 'lucide-react';

interface AIInsight {
  id: string;
  insight_type: 'recommendation' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  confidence_score: number;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  okr_objective_id?: string;
  metric_type_id?: string;
  action_items?: string[];
}

interface AIInsightsProps {
  brandId?: string;
  className?: string;
}

export function AIInsights({ brandId, className = '' }: AIInsightsProps) {
  const { data: insights, isLoading, error, refetch } = useAIInsights(brandId);

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
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'opportunity':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'trend':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading AI Insights</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading your AI insights. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Insights Available</h3>
          <p className="text-gray-600 mb-4">
            AI insights will appear here as your OKR data accumulates. Check back later for personalized recommendations.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'recommendation';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  // Sort insights by priority and confidence score
  Object.keys(groupedInsights).forEach(type => {
    groupedInsights[type].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence_score - a.confidence_score;
    });
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            AI-generated insights based on your OKR performance patterns, trends, and benchmarks.
          </p>
        </CardContent>
      </Card>

      {Object.entries(groupedInsights).map(([type, typeInsights]) => {
        const Icon = getInsightIcon(type);
        const typeTitle = type.charAt(0).toUpperCase() + type.slice(1) + 's';
        
        return (
          <div key={type} className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">{typeTitle}</h3>
              <Badge variant="secondary">{typeInsights.length}</Badge>
            </div>
            
            <div className="grid gap-4">
              {typeInsights.map(insight => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {insight.title}
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge 
                            className={`text-xs ${getPriorityColor(insight.priority)}`}
                            variant="outline"
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {insight.confidence_score}% confidence
                          </div>
                        </div>
                      </div>

                      {/* Action Items */}
                      {insight.action_items && insight.action_items.length > 0 && (
                        <div className="pt-3 border-t">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            Recommended Actions:
                          </h5>
                          <ul className="space-y-1">
                            {insight.action_items.map((action, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getInsightColor(insight.insight_type)}`}>
                          <Icon className="h-3 w-3" />
                          {insight.insight_type}
                        </div>
                        <div>
                          Generated: {new Date(insight.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}