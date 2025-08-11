'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculateOKRStatus } from '../../utils/okrCalculations';
import type { OKRMetric } from '../../types/okr';

interface StatusDonutChartProps {
  metrics: OKRMetric[];
  className?: string;
}

export function StatusDonutChart({ metrics, className = '' }: StatusDonutChartProps) {
  const chartData = React.useMemo(() => {
    const statusCounts = {
      'In Progress': 0,
      'Completed': 0,
      'Not Started': 0,
    };

    metrics.forEach(metric => {
      const status = calculateOKRStatus(metric);
      
      if (status.status === 'Target Achieved' || status.status === 'Completed') {
        statusCounts['Completed']++;
      } else if (status.status === 'Not Started') {
        statusCounts['Not Started']++;
      } else {
        statusCounts['In Progress']++;
      }
    });

    return [
      { name: 'In Progress', value: statusCounts['In Progress'], color: '#f59e0b' }, // Warm orange
      { name: 'Completed', value: statusCounts['Completed'], color: '#10b981' }, // Green
      { name: 'Not Started', value: statusCounts['Not Started'], color: '#64748b' }, // Cool slate
    ].filter(item => item.value > 0); // Only show non-zero values
  }, [metrics]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} OKRs ({Math.round((data.value / metrics.length) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (metrics.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Status of Goals</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Status of Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="#ffffff"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend payload={chartData} />
      </CardContent>
    </Card>
  );
}