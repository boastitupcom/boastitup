"use client";

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
  className?: string;
}

export function DashboardHeader({ 
  onRefresh, 
  isRefreshing = false, 
  lastUpdated,
  className 
}: DashboardHeaderProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (onRefresh) {
            onRefresh();
          }
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            OKR Performance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time tracking of key objectives and results across all business units
          </p>
        </div>

        {/* Refresh Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {/* Auto-refresh countdown */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Auto-refresh in {countdown}s</span>
            </div>

            {/* Manual refresh button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "border border-gray-300 bg-white text-gray-700",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isRefreshing && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg 
                className={cn("w-4 h-4", isRefreshing && "animate-spin")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 border-b border-gray-200" />
    </div>
  );
}