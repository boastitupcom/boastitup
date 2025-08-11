'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calculateOKRStatus } from '../../utils/okrCalculations';
import { format, addMonths, startOfMonth } from 'date-fns';
import type { OKRMetric } from '../../types/okr';

interface EndDateBarChartProps {
  metrics: OKRMetric[];
  className?: string;
}

export function EndDateBarChart({ metrics, className = '' }: EndDateBarChartProps) {
  const chartData = React.useMemo(() => {
    // Generate next 12 months
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startOfMonth(now), i);
      const monthKey = format(monthDate, 'MMM yyyy');
      
      months.push({
        month: monthKey,
        'In Progress': 0,
        'Completed': 0,
        'Not Started': 0,
      });
    }

    // For demo purposes, distribute metrics across months
    // In a real implementation, this would use actual end_date from the OKR data
    metrics.forEach((metric, index) => {
      const status = calculateOKRStatus(metric);
      const monthIndex = index % 12; // Distribute across months
      
      let statusKey = 'In Progress';
      if (status.status === 'Target Achieved' || status.status === 'Completed') {
        statusKey = 'Completed';
      } else if (status.status === 'Not Started') {
        statusKey = 'Not Started';
      }
      
      months[monthIndex][statusKey as keyof typeof months[0]]++;
    });

    return months;
  }, [metrics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 mb-3 text-center">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {entry.value} OKRs
                </span>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{total} OKRs</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">End Date by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="Completed" 
                stackId="status" 
                fill="#059669" 
                name="Completed"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="In Progress" 
                stackId="status" 
                fill="#7c3aed" 
                name="In Progress"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="Not Started" 
                stackId="status" 
                fill="#e11d48" 
                name="Not Started"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}