"use client";

import React from 'react';
import { Loader2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';
import { Progress } from './progress';

/**
 * Enhanced loading states following story.txt line 476
 * Skeleton screens for initial loads, progress indicators for long operations
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * AI Generation loading with branded experience
 */
export function AIGenerationLoading({ progress, currentStep }: { progress?: number; currentStep?: string }) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="relative">
        <div className="animate-pulse">
          <Sparkles className="h-16 w-16 text-primary mx-auto" />
        </div>
        <div className="absolute inset-0 animate-ping">
          <Sparkles className="h-16 w-16 text-primary/30 mx-auto" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">AI is crafting your OKRs</h3>
        <p className="text-muted-foreground">
          {currentStep || 'Analyzing your brand context and generating personalized suggestions...'}
        </p>
      </div>

      {typeof progress === 'number' && (
        <div className="max-w-xs mx-auto">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
        </div>
      )}

      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * OKR Template Grid Skeleton
 */
export function OKRTemplateGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * OKR Management Table Skeleton
 */
export function OKRTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4 items-center">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 animate-pulse">
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Metrics Skeleton
 */
export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Form Loading Overlay
 */
export function FormLoadingOverlay({ 
  isVisible, 
  message = "Saving changes..." 
}: { 
  isVisible: boolean; 
  message?: string; 
}) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-lg p-6 shadow-lg">
        <LoadingSpinner size="lg" text={message} />
      </div>
    </div>
  );
}

/**
 * Long Operation Progress
 */
export function LongOperationProgress({
  title,
  description,
  progress,
  steps,
  currentStep
}: {
  title: string;
  description?: string;
  progress: number;
  steps?: string[];
  currentStep?: number;
}) {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      <Target className="h-12 w-12 text-primary mx-auto" />
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">{progress}% complete</p>
      </div>

      {steps && currentStep !== undefined && (
        <div className="text-left space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 text-sm ${
                index < currentStep ? 'text-primary' : 
                index === currentStep ? 'text-foreground' : 
                'text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              ) : index === currentStep ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary animate-pulse" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted" />
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon: Icon = Target,
  title,
  description,
  action
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}