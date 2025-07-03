// apps/web/app/workspace/analytics/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useAnalyticsData } from '@boastitup/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (chartRef.current && data?.benchmarks) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.benchmarks.labels,
            datasets: [
              {
                label: 'Current Period',
                data: data.benchmarks.current,
                backgroundColor: 'rgba(56, 189, 248, 0.7)',
                borderColor: 'rgba(14, 165, 233, 1)',
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: 'Previous Period',
                data: data.benchmarks.previous,
                backgroundColor: 'rgba(203, 213, 225, 0.7)',
                borderColor: 'rgba(100, 116, 139, 1)',
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { position: 'bottom' } },
          },
        });
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading Growth Hub...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error loading data: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Growth Hub</h1>
        <p className="text-slate-600 mt-1">Build lean, mean customer acquisition machines. An interactive analysis.</p>
      </header>

      <main className="space-y-8">
        <section id="kpis">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.kpis.map((kpi) => (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">{kpi.title}</CardTitle>
                  <span className={`text-xs font-semibold ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{kpi.change}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="strategic-insights">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Strategic Insights & Opportunities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data?.marketPulse.map((item) => (
                    <li key={item.item} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.item}</p>
                        <p className="text-xs text-slate-500">{item.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{item.change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Growth Levers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data?.growthLevers.map((item) => (
                    <li key={item.name} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-emerald-500">{item.status}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{item.change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {data?.opportunityRadar.map((item) => (
                    <li key={item.title}>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.score}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <canvas ref={chartRef}></canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}