"use client";

import * as React from "react";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";

export type GranularityOption = 'daily' | 'weekly' | 'monthly';

export interface GranularityToggleProps {
  value?: GranularityOption;
  onValueChange?: (value: GranularityOption) => void;
  disabled?: boolean;
  showDescription?: boolean;
  variant?: 'default' | 'compact' | 'cards';
  className?: string;
}

const granularityOptions: Array<{
  value: GranularityOption;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  color: string;
  recommendation: string;
}> = [
  {
    value: 'daily',
    label: 'Daily Tracking',
    shortLabel: 'Daily',
    description: 'Track progress every day for immediate insights',
    icon: Clock,
    color: 'bg-red-100 text-red-800 border-red-200',
    recommendation: 'Best for operational metrics that change frequently'
  },
  {
    value: 'weekly',
    label: 'Weekly Tracking',
    shortLabel: 'Weekly',
    description: 'Monitor progress weekly for balanced oversight',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    recommendation: 'Ideal for most marketing and growth metrics'
  },
  {
    value: 'monthly',
    label: 'Monthly Tracking',
    shortLabel: 'Monthly',
    description: 'Review progress monthly for strategic metrics',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200',
    recommendation: 'Perfect for long-term strategic objectives'
  }
];

export function GranularityToggle({
  value = 'weekly',
  onValueChange,
  disabled = false,
  showDescription = true,
  variant = 'default',
  className
}: GranularityToggleProps) {
  const selectedOption = granularityOptions.find(option => option.value === value);

  const handleSelect = (granularity: GranularityOption) => {
    if (disabled || granularity === value) return;
    onValueChange?.(granularity);
  };

  const renderCompactVariant = () => (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Tracking Frequency</Label>
      <div className="flex rounded-lg border p-1 bg-muted">
        {granularityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                isSelected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="h-3 w-3" />
              {option.shortLabel}
            </button>
          );
        })}
      </div>
      {showDescription && selectedOption && (
        <p className="text-xs text-muted-foreground">
          {selectedOption.description}
        </p>
      )}
    </div>
  );

  const renderCardsVariant = () => (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">Choose Tracking Frequency</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {granularityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleSelect(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{option.shortLabel}</h4>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    {showDescription && (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {option.recommendation}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDefaultVariant = () => (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">Tracking Granularity</Label>
      <div className="space-y-2">
        {granularityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <Button
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={cn(
                "w-full justify-start h-auto p-3",
                !isSelected && "text-left"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium">{option.label}</div>
                  {showDescription && (
                    <div className="text-xs opacity-75 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Badge variant="secondary" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
      
      {showDescription && selectedOption && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Recommendation:</strong> {selectedOption.recommendation}
          </p>
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'cards':
      return renderCardsVariant();
    default:
      return renderDefaultVariant();
  }
}

// Helper function to get granularity display info
export function getGranularityInfo(granularity: GranularityOption) {
  return granularityOptions.find(option => option.value === granularity);
}

// Skeleton component for loading states
export function GranularityToggleSkeleton({ 
  variant = 'default',
  className 
}: { 
  variant?: GranularityToggleProps['variant'];
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-lg border animate-pulse" />
        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-200 rounded-lg border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-12 w-full bg-gray-200 rounded border animate-pulse" />
        ))}
      </div>
      <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
    </div>
  );
}