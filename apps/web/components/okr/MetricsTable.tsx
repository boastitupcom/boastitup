'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@boastitup/ui';
import { OKRHealthBadge } from './OKRHealthBadge';
import { calculateOKRStatus } from '../../utils/okrCalculations';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface OKRMetric {
  objective_name: string;
  metric_name: string;
  current_value: number;
  metric_target_value: number;
  performance_status: string;
  okr_category?: string;
  platform_name?: string;
  time_progress_percent?: number;
}

interface MetricsTableProps {
  metrics: OKRMetric[];
  onMetricClick?: (metric: OKRMetric) => void;
  className?: string;
}

type SortField = 'objective_name' | 'progress' | 'current_value' | 'metric_target_value';
type SortDirection = 'asc' | 'desc' | null;

export function MetricsTable({ metrics, onMetricClick, className = '' }: MetricsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMetrics = React.useMemo(() => {
    if (!sortField || !sortDirection) return metrics;

    return [...metrics].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'objective_name':
          aValue = a.objective_name.toLowerCase();
          bValue = b.objective_name.toLowerCase();
          break;
        case 'progress':
          aValue = calculateOKRStatus(a).progress_percentage;
          bValue = calculateOKRStatus(b).progress_percentage;
          break;
        case 'current_value':
          aValue = a.current_value;
          bValue = b.current_value;
          break;
        case 'metric_target_value':
          aValue = a.metric_target_value;
          bValue = b.metric_target_value;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [metrics, sortField, sortDirection]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold text-xs text-gray-700 hover:text-gray-900"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  if (metrics.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No metrics found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">OKR Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <SortButton field="objective_name">Objective</SortButton>
                </th>
                <th className="text-left py-3 px-4">Metric</th>
                <th className="text-right py-3 px-4">
                  <SortButton field="current_value">Current</SortButton>
                </th>
                <th className="text-right py-3 px-4">
                  <SortButton field="metric_target_value">Target</SortButton>
                </th>
                <th className="text-center py-3 px-4">
                  <SortButton field="progress">Progress</SortButton>
                </th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Health</th>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((metric, index) => {
                const status = calculateOKRStatus(metric);
                return (
                  <tr 
                    key={index}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onMetricClick?.(metric)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-sm text-gray-900 truncate max-w-48">
                          {metric.objective_name}
                        </div>
                        {metric.okr_category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {metric.okr_category}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700 truncate max-w-32">
                        {metric.metric_name}
                      </div>
                      {metric.platform_name && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {metric.platform_name}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">
                      {metric.current_value?.toLocaleString() ?? 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">
                      {metric.metric_target_value?.toLocaleString() ?? 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="text-sm font-medium">
                          {status.progress_percentage}%
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {status.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <OKRHealthBadge health={status.health} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}