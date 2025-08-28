'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from '@boastitup/ui';
import { 
  Search, 
  ThumbsUp, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InsightCardProps, InsightData, CategoryType } from '../../types/brand-health';
import { getCategoryTheme } from '../../types/brand-health';

const CategoryIcons = {
  'Awareness': Search,
  'Consideration': ThumbsUp,
  'Trust & Credibility': Shield,
};

interface InsightItemProps {
  insight: InsightData;
}

const InsightItem = ({ insight }: InsightItemProps) => {
  const getStatusBadgeVariant = (status: InsightData['insight_status']) => {
    switch (status) {
      case 'Good':
        return 'default';
      case 'Needs Attention':
        return 'secondary';
      case 'Critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTrendIcon = (yoyChange: number) => {
    if (yoyChange > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (yoyChange < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatMetricValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="flex items-start justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {insight.insight_title}
          </h4>
          {getTrendIcon(insight.yoy_change_percent)}
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {insight.insight_text}
        </p>
        
        {insight.metric_value && (
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatMetricValue(insight.metric_value)}
            </span>
            {insight.yoy_change_percent !== 0 && (
              <span className={cn(
                "text-xs font-medium",
                insight.yoy_change_percent > 0 ? "text-green-600" : "text-red-600"
              )}>
                {insight.yoy_change_percent > 0 ? '+' : ''}
                {insight.yoy_change_percent.toFixed(1)}% YoY
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <Badge variant={getStatusBadgeVariant(insight.insight_status)}>
          {insight.insight_status}
        </Badge>
      </div>
    </div>
  );
};

const InsightCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start justify-between p-3 border-b border-gray-100">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-6 w-16 ml-4" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function InsightCard({ 
  category, 
  insights, 
  isExpanded = false,
  isLoading = false 
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const theme = getCategoryTheme(category);
  const IconComponent = CategoryIcons[category];
  
  if (isLoading) {
    return <InsightCardSkeleton />;
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5" style={{ color: theme.color }} />
            <span>{category}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No insights available for this category</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleInsights = expanded ? insights : insights.slice(0, 3);
  const hasMore = insights.length > 3;
  
  const categoryStats = insights.reduce((acc, insight) => {
    acc[insight.insight_status] = (acc[insight.insight_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className={cn("w-full", theme.bgColor, theme.borderColor)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5" style={{ color: theme.color }} />
            <span>{category}</span>
            <Badge variant="outline" className="ml-2">
              {insights.length}
            </Badge>
          </div>
          
          {/* Category Stats */}
          <div className="flex items-center space-x-2 text-sm">
            {categoryStats['Good'] && (
              <Badge variant="default" className="text-xs">
                {categoryStats['Good']} Good
              </Badge>
            )}
            {categoryStats['Needs Attention'] && (
              <Badge variant="secondary" className="text-xs">
                {categoryStats['Needs Attention']} Attention
              </Badge>
            )}
            {categoryStats['Critical'] && (
              <Badge variant="destructive" className="text-xs">
                {categoryStats['Critical']} Critical
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-0">
          {visibleInsights.map((insight, index) => (
            <InsightItem key={index} insight={insight} />
          ))}
        </div>
        
        {/* Expand/Collapse Button */}
        {hasMore && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <span>
                {expanded ? 'Show Less' : `Show ${insights.length - 3} More`}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}