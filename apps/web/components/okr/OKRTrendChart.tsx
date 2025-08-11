'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@boastitup/ui';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendDataPoint {
  date: string;
  value: number;
  metric_name: string;
  target_value?: number;
}

interface OKRTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  className?: string;
}

export function OKRTrendChart({ data, title = 'OKR Performance Trends', className = '' }: OKRTrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Group data by metric and format for chart
  const chartData = React.useMemo(() => {
    const grouped = data.reduce((acc, point) => {
      const date = format(parseISO(point.date), 'MMM dd');
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing[point.metric_name] = point.value;
        if (point.target_value) {
          existing[`${point.metric_name}_target`] = point.target_value;
        }
      } else {
        acc.push({
          date,
          [point.metric_name]: point.value,
          ...(point.target_value && { [`${point.metric_name}_target`]: point.target_value }),
        });
      }
      
      return acc;
    }, [] as any[]);
    
    return grouped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Get unique metrics for coloring
  const metrics = React.useMemo(() => {
    const uniqueMetrics = [...new Set(data.map(d => d.metric_name))];
    return uniqueMetrics.map((metric, index) => ({
      name: metric,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No trend data available.</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey.replace('_target', ' (Target)')}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === 'area' ? 'default' : 'outline'}
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {metrics.map(metric => (
                  <React.Fragment key={metric.name}>
                    <Line
                      type="monotone"
                      dataKey={metric.name}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    {chartData.some(d => d[`${metric.name}_target`] !== undefined) && (
                      <Line
                        type="monotone"
                        dataKey={`${metric.name}_target`}
                        stroke={metric.color}
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                      />
                    )}
                  </React.Fragment>
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {metrics.map((metric, index) => (
                  <Area
                    key={metric.name}
                    type="monotone"
                    dataKey={metric.name}
                    stroke={metric.color}
                    fill={metric.color}
                    fillOpacity={0.1 + (index * 0.1)}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}