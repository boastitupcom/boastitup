'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@boastitup/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateOKRStatus } from '../../utils/okrCalculations';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface OKRMetric {
  // New field names from v_okr_performance
  title?: string;
  status?: string;
  target_value?: number;
  // Backward compatibility
  objective_name?: string;
  metric_name?: string;
  current_value: number;
  metric_target_value?: number;
  performance_status?: string;
  okr_category?: string;
}

interface DashboardStatsProps {
  metrics: OKRMetric[];
  className?: string;
}

export function DashboardStats({ metrics, className = '' }: DashboardStatsProps) {
  const stats = React.useMemo(() => {
    const total = metrics.length;
    const statusCounts = {
      'Target Achieved': 0,
      'On Track': 0,
      'Behind': 0,
      'At Risk': 0,
      'Not Started': 0,
    };
    
    const healthCounts = {
      green: 0,
      yellow: 0,
      red: 0,
      gray: 0,
    };

    metrics.forEach(metric => {
      const status = calculateOKRStatus(metric);
      
      // Count by status
      if (statusCounts.hasOwnProperty(status.status)) {
        statusCounts[status.status as keyof typeof statusCounts]++;
      }
      
      // Count by health
      healthCounts[status.health]++;
    });

    return {
      total,
      statusCounts,
      healthCounts,
      completionRate: total > 0 ? Math.round((statusCounts['Target Achieved'] / total) * 100) : 0,
      atRiskCount: statusCounts['At Risk'] + statusCounts['Behind'],
    };
  }, [metrics]);

  const chartData = [
    { name: 'Excellent', count: stats.healthCounts.green, color: '#10b981' },
    { name: 'Good', count: stats.healthCounts.yellow, color: '#f59e0b' },
    { name: 'At Risk', count: stats.healthCounts.red, color: '#ef4444' },
    { name: 'N/A', count: stats.healthCounts.gray, color: '#6b7280' },
  ];

  const statCards = [
    {
      title: 'Total OKRs',
      value: stats.total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'On Track',
      value: stats.statusCounts['On Track'],
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Need Attention',
      value: stats.atRiskCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.statusCounts).map(([status, count]) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                let badgeColor = 'secondary';
                
                switch (status) {
                  case 'Target Achieved':
                    badgeColor = 'default';
                    break;
                  case 'On Track':
                    badgeColor = 'secondary';
                    break;
                  case 'Behind':
                    badgeColor = 'outline';
                    break;
                  case 'At Risk':
                    badgeColor = 'destructive';
                    break;
                }
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeColor as any} className="text-xs">
                        {status}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} OKRs</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Health Score Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}