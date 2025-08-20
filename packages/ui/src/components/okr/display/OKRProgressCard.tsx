"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Clock } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";

export interface OKRProgressData {
  id: string;
  title: string;
  description?: string;
  current_value: number;
  target_value: number;
  unit?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  target_date: string;
  created_at: string;
  updated_at: string;
  platform?: {
    name: string;
    display_name: string;
    category: string;
  };
  metric_type: {
    code: string;
    description: string;
    unit?: string;
    category: string;
  };
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
}

export interface OKRProgressCardProps {
  okr: OKRProgressData;
  onEdit?: (okrId: string) => void;
  onViewDetails?: (okrId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function OKRProgressCard({
  okr,
  onEdit,
  onViewDetails,
  showActions = true,
  compact = false,
  className
}: OKRProgressCardProps) {
  const progressPercentage = Math.min(Math.round((okr.current_value / okr.target_value) * 100), 100);
  const isOverdue = new Date(okr.target_date) < new Date() && okr.status !== 'completed';
  const daysUntilTarget = Math.ceil((new Date(okr.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    switch (okr.status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (okr.priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = () => {
    switch (okr.priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  };

  const getProgressColor = () => {
    if (progressPercentage >= 90) return 'bg-green-600';
    if (progressPercentage >= 70) return 'bg-blue-600';
    if (progressPercentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getTrendIcon = () => {
    if (!okr.trend) return null;
    
    switch (okr.trend.direction) {
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

  const formatValue = (value: number) => {
    const unit = okr.unit || okr.metric_type.unit;
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit ? ` ${unit}` : ''}`;
    }
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <Card className={cn(
      "relative transition-all duration-200 hover:shadow-md",
      isOverdue && okr.status === 'active' && "border-red-200 bg-red-50/30",
      okr.status === 'completed' && "border-green-200 bg-green-50/30",
      compact && "p-3",
      className
    )}>
      {/* Priority Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full rounded-l-lg",
        okr.priority === 1 && "bg-red-500",
        okr.priority === 2 && "bg-yellow-500",
        okr.priority === 3 && "bg-green-500"
      )} />

      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "text-base leading-tight",
              compact && "text-sm"
            )}>
              {okr.title}
            </CardTitle>
            {okr.description && !compact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {okr.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 ml-3">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getStatusColor())}
            >
              {okr.status}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPriorityColor())}
            >
              {getPriorityLabel()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {progressPercentage}%
              </span>
              {okr.trend && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={cn(
                    "text-xs font-medium",
                    okr.trend.direction === 'up' && "text-green-600",
                    okr.trend.direction === 'down' && "text-red-600",
                    okr.trend.direction === 'stable' && "text-gray-600"
                  )}>
                    {okr.trend.percentage > 0 ? '+' : ''}{okr.trend.percentage}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium">
                {formatValue(okr.current_value)} / {formatValue(okr.target_value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {okr.metric_type.description}
              </div>
            </div>
          </div>

          <Progress 
            value={progressPercentage} 
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
        </div>

        {/* Meta Information */}
        {!compact && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Target Date</div>
                <div className={cn(
                  "text-xs",
                  isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                )}>
                  {new Date(okr.target_date).toLocaleDateString()}
                  {isOverdue && " (Overdue)"}
                  {!isOverdue && daysUntilTarget > 0 && ` (${daysUntilTarget} days left)`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Granularity</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {okr.granularity}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform and Metric Info */}
        {!compact && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {okr.platform && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-medium">{okr.platform.display_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{okr.metric_type.category}</span>
              </div>
            </div>
            
            {okr.trend && (
              <div className="text-muted-foreground">
                Trend: {okr.trend.period}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(okr.id)}
                className="text-xs"
              >
                View Details
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(okr.id)}
                className="text-xs"
              >
                Quick Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OKRProgressCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={cn("relative", compact && "p-3")}>
      <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 rounded-l-lg" />
      
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className={cn("h-5 bg-gray-200 rounded animate-pulse", compact ? "w-32" : "w-48")} />
            {!compact && <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="text-right space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-18 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        )}

        {!compact && (
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}