// apps/web/components/KPIScoreCardGrid.tsx
'use client';

import React from 'react';
import type { KPIScorecard } from '@boastitup/types';
import { TrendingUp, Users, CircleDollarSign, Repeat } from 'lucide-react';

interface KPIScoreCardGridProps {
  kpis: KPIScorecard[];
  gridColumns?: number;
  showTrends?: boolean;
  onKPIClick?: (kpi: KPIScorecard) => void;
  className?: string;
}

const StatusColors = {
  above_target: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    progress: 'bg-green-500',
    text: 'text-green-800',
  },
  on_target: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    progress: 'bg-blue-500',
    text: 'text-blue-800',
  },
  below_target: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    progress: 'bg-orange-500',
    text: 'text-orange-800',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    progress: 'bg-red-500',
    text: 'text-red-800',
  },
};

const CategoryLabels = {
  traffic: 'Traffic Metrics',
  conversion: 'Conversion Metrics',
  revenue: 'Revenue Metrics',
  engagement: 'Engagement Metrics',
  social: 'Social Metrics',
};

const IconComponents = {
  TrendingUp,
  Users,
  CircleDollarSign,
  Repeat,
};

export default function KPIScoreCardGrid({
  kpis,
  gridColumns = 3,
  showTrends = true,
  onKPIClick,
  className = '',
}: KPIScoreCardGridProps) {
  const formatValue = (value: number, unitType: string) => {
    switch (unitType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: value >= 1000000 ? 'compact' : 'standard',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return new Intl.NumberFormat('en-US', {
          notation: value >= 1000 ? 'compact' : 'standard',
        }).format(value);
      default:
        return value.toString();
    }
  };

  // Group KPIs by category
  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPIScorecard[]>);

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[gridColumns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (kpis.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No KPI data available</div>
          <div className="text-gray-500 text-sm">KPI metrics will appear here once data is available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">KPI Scorecards</h2>
        {showTrends && (
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {CategoryLabels[category as keyof typeof CategoryLabels] || category}
          </h3>
          
          {/* KPI Cards Grid */}
          <div className={`grid gap-4 ${gridColsClass}`}>
            {categoryKPIs.map((kpi) => {
              const colors = StatusColors[kpi.status] || StatusColors.on_target;
              
              return (
                <div
                  key={kpi.id}
                  className={`
                    rounded-lg border ${colors.border} ${colors.bg} p-4 
                    ${onKPIClick ? 'cursor-pointer hover:shadow-lg' : ''}
                    transition-all duration-200
                  `}
                  onClick={() => onKPIClick?.(kpi)}
                >
                  {/* KPI Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${kpi.color || 'gray'}-100`}>
                        {kpi.icon && IconComponents[kpi.icon] && 
                          React.createElement(IconComponents[kpi.icon], {
                            className: `w-5 h-5 text-${kpi.color || 'gray'}-600`
                          })
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {kpi.display_name}
                        </h4>
                      </div>
                    </div>
                    {kpi.alert_level !== 'none' && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${kpi.alert_level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {kpi.alert_level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Current Value */}
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatValue(kpi.current_value, kpi.unit_type)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Target: {formatValue(kpi.target_value, kpi.unit_type)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-gray-700">
                        {kpi.progress_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${colors.progress}`}
                        style={{
                          width: `${Math.min(kpi.progress_percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Change and Trend */}
                  {showTrends && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <span className={`font-medium ${
                          kpi.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {kpi.change_percentage >= 0 ? '↑' : '↓'} {Math.abs(kpi.change_percentage).toFixed(1)}%
                        </span>
                        <span className="text-gray-500">vs last month</span>
                      </div>
                      
                      {/* Trend Direction */}
                      <div className={`text-xs px-2 py-1 rounded ${colors.text} ${colors.bg}`}>
                        {kpi.trend_direction.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}