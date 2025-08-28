"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus, Target, Clock, Zap } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

export interface MetricData {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  value?: number;
  target?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  status?: 'on-track' | 'at-risk' | 'off-track' | 'completed';
}

export interface MetricBadgeProps {
  metric: MetricData;
  variant?: 'default' | 'compact' | 'detailed' | 'trend-only';
  showTrend?: boolean;
  showValue?: boolean;
  showTarget?: boolean;
  showTooltip?: boolean;
  className?: string;
  onClick?: (metricId: string) => void;
}

export function MetricBadge({
  metric,
  variant = 'default',
  showTrend = true,
  showValue = true,
  showTarget = false,
  showTooltip = true,
  className,
  onClick
}: MetricBadgeProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getStatusColor = () => {
    switch (metric.status) {
      case 'on-track': return 'bg-green-100 text-green-800 border-green-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off-track': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = () => {
    const category = metric.category.toLowerCase();
    
    if (category.includes('engagement')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (category.includes('growth')) return 'bg-green-100 text-green-800 border-green-200';
    if (category.includes('revenue')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (category.includes('performance')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (category.includes('reach')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (category.includes('conversion')) return 'bg-pink-100 text-pink-800 border-pink-200';
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTrendIcon = () => {
    if (!metric.trend || !showTrend) return null;
    
    switch (metric.trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = () => {
    const category = metric.category.toLowerCase();
    
    if (category.includes('engagement')) return <Zap className="h-3 w-3" />;
    if (category.includes('growth')) return <TrendingUp className="h-3 w-3" />;
    if (category.includes('performance')) return <Target className="h-3 w-3" />;
    if (category.includes('time')) return <Clock className="h-3 w-3" />;
    
    return <Target className="h-3 w-3" />;
  };

  const renderCompactBadge = () => (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium cursor-pointer hover:shadow-sm transition-all",
        getCategoryColor(),
        onClick && "hover:scale-105",
        className
      )}
      onClick={() => onClick?.(metric.id)}
    >
      <div className="flex items-center gap-1">
        {getCategoryIcon()}
        <span>{metric.code}</span>
        {showValue && metric.value !== undefined && (
          <span className="font-bold">
            {formatValue(metric.value)}{metric.unit}
          </span>
        )}
        {getTrendIcon()}
      </div>
    </Badge>
  );

  const renderDetailedBadge = () => (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
        getCategoryColor(),
        onClick && "cursor-pointer hover:shadow-sm hover:scale-105 transition-all",
        className
      )}
      onClick={() => onClick?.(metric.id)}
    >
      <div className="flex items-center gap-1">
        {getCategoryIcon()}
        <span className="font-medium">{metric.code}</span>
      </div>
      
      {showValue && metric.value !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg">
            {formatValue(metric.value)}
          </span>
          {metric.unit && (
            <span className="text-xs opacity-75">{metric.unit}</span>
          )}
        </div>
      )}
      
      {showTarget && metric.target !== undefined && (
        <div className="text-xs opacity-75">
          / {formatValue(metric.target)}{metric.unit}
        </div>
      )}
      
      {metric.trend && showTrend && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={cn(
            "text-xs font-medium",
            metric.trend.direction === 'up' && "text-green-600",
            metric.trend.direction === 'down' && "text-red-600",
            metric.trend.direction === 'stable' && "text-gray-600"
          )}>
            {metric.trend.percentage > 0 ? '+' : ''}{metric.trend.percentage}%
          </span>
        </div>
      )}
    </div>
  );

  const renderTrendOnlyBadge = () => {
    if (!metric.trend) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs",
          metric.trend.direction === 'up' && "bg-green-50 text-green-700 border-green-200",
          metric.trend.direction === 'down' && "bg-red-50 text-red-700 border-red-200",
          metric.trend.direction === 'stable' && "bg-gray-50 text-gray-700 border-gray-200",
          onClick && "cursor-pointer hover:shadow-sm hover:scale-105 transition-all",
          className
        )}
        onClick={() => onClick?.(metric.id)}
      >
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className="font-medium">
            {metric.trend.percentage > 0 ? '+' : ''}{metric.trend.percentage}%
          </span>
          <span className="opacity-75">
            {metric.trend.period}
          </span>
        </div>
      </Badge>
    );
  };

  const renderDefaultBadge = () => (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs",
        metric.status ? getStatusColor() : getCategoryColor(),
        onClick && "cursor-pointer hover:shadow-sm hover:scale-105 transition-all",
        className
      )}
      onClick={() => onClick?.(metric.id)}
    >
      <div className="flex items-center gap-1">
        {getCategoryIcon()}
        <span className="font-medium">{metric.description}</span>
        
        {showValue && metric.value !== undefined && (
          <>
            <span className="mx-1">•</span>
            <span className="font-bold">
              {formatValue(metric.value)}{metric.unit}
            </span>
          </>
        )}
        
        {showTarget && metric.target !== undefined && (
          <span className="opacity-75">
            /{formatValue(metric.target)}{metric.unit}
          </span>
        )}
        
        {getTrendIcon()}
      </div>
    </Badge>
  );

  const renderBadge = () => {
    switch (variant) {
      case 'compact':
        return renderCompactBadge();
      case 'detailed':
        return renderDetailedBadge();
      case 'trend-only':
        return renderTrendOnlyBadge();
      default:
        return renderDefaultBadge();
    }
  };

  const tooltipContent = showTooltip && (
    <div className="space-y-2">
      <div>
        <div className="font-medium">{metric.description}</div>
        <div className="text-xs opacity-75">Code: {metric.code}</div>
      </div>
      
      {metric.value !== undefined && (
        <div className="text-sm">
          <span className="font-medium">Current: </span>
          {formatValue(metric.value)}{metric.unit}
        </div>
      )}
      
      {metric.target !== undefined && (
        <div className="text-sm">
          <span className="font-medium">Target: </span>
          {formatValue(metric.target)}{metric.unit}
        </div>
      )}
      
      {metric.trend && (
        <div className="text-sm">
          <span className="font-medium">Trend: </span>
          <span className={cn(
            metric.trend.direction === 'up' && "text-green-600",
            metric.trend.direction === 'down' && "text-red-600",
            metric.trend.direction === 'stable' && "text-gray-600"
          )}>
            {metric.trend.percentage > 0 ? '+' : ''}{metric.trend.percentage}%
          </span>
          <span className="opacity-75"> ({metric.trend.period})</span>
        </div>
      )}
      
      <div className="text-xs opacity-75">
        Category: {metric.category}
      </div>
    </div>
  );

  if (showTooltip && tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {renderBadge()}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderBadge();
}

// Helper function to create metric badges from different data sources
export function createMetricBadge(
  data: {
    id: string;
    code: string;
    description: string;
    unit?: string;
    category: string;
  },
  options?: {
    value?: number;
    target?: number;
    trend?: MetricData['trend'];
    status?: MetricData['status'];
  }
): MetricData {
  return {
    ...data,
    value: options?.value,
    target: options?.target,
    trend: options?.trend,
    status: options?.status
  };
}

// Skeleton component for loading states
export function MetricBadgeSkeleton({ 
  variant = 'default',
  className 
}: { 
  variant?: MetricBadgeProps['variant'];
  className?: string;
}) {
  const getSkeletonWidth = () => {
    switch (variant) {
      case 'compact': return 'w-16';
      case 'detailed': return 'w-32';
      case 'trend-only': return 'w-20';
      default: return 'w-24';
    }
  };

  return (
    <div className={cn(
      "h-6 bg-gray-200 rounded-full animate-pulse",
      getSkeletonWidth(),
      className
    )} />
  );
}