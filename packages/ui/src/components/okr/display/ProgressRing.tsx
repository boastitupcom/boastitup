'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

// Progress color logic based on story.txt specifications
const getProgressColor = (progress: number): string => {
  if (progress >= 80) return '#22c55e'; // Green for >80%
  if (progress >= 50) return '#3b82f6'; // Blue for 50-79%
  if (progress >= 40) return '#eab308'; // Yellow for 40-59%
  return '#ef4444'; // Red for <40%
};

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4, 
  className = '',
  showPercentage = true,
  animated = true
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(animated ? 0 : progress);
  const safeProgress = isNaN(progress) || progress == null ? 0 : Math.max(0, Math.min(100, progress));
  
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(safeProgress);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedProgress(safeProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeProgress, animated]);

  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  const color = getProgressColor(safeProgress);

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progress: ${Math.round(safeProgress)}%`}
      >
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className={animated ? "transition-all duration-500 ease-in-out" : ""}
        />
      </svg>
      {/* Progress text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(safeProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Skeleton component for loading states
export function ProgressRingSkeleton({ 
  size = 60, 
  className = '' 
}: { 
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <div 
        className="rounded-full bg-gray-200 animate-pulse"
        style={{ width: size, height: size }}
      />
    </div>
  );
}