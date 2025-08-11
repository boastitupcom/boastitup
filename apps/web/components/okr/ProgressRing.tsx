'use client';

import React, { useEffect, useState } from 'react';
import { getProgressColor } from '../../utils/okrCalculations';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4, 
  className = '' 
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const safeProgress = isNaN(progress) || progress == null ? 0 : Math.max(0, Math.min(100, progress));
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(safeProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeProgress]);

  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  const color = getProgressColor(safeProgress);

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
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
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(safeProgress)}%
        </span>
      </div>
    </div>
  );
}