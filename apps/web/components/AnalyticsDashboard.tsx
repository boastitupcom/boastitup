// apps/web/components/AnalyticsDashboard.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useAnalyticsData } from '@boastitup/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { Chart, registerables } from 'chart.js';
import { createClient } from '@boastitup/supabase/client';

Chart.register(...registerables);

interface AnalyticsDashboardProps {
  tenantId: string | null;
  brandId: string | null;
}

export function AnalyticsDashboard({ tenantId, brandId }: AnalyticsDashboardProps) {
  const supabase = createClient();
  const { data, isLoading, error } = useAnalyticsData(supabase, tenantId, brandId);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Log the props for debugging
  useEffect(() => {
    console.log('🎨 AnalyticsDashboard rendered with props:', { tenantId, brandId });
    console.log('📊 Hook state:', { hasData: !!data, isLoading, hasError: !!error });
  }, [tenantId, brandId, data, isLoading, error]);

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
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Loading Analytics...</div>
        <div className="text-sm text-gray-500 mt-2">
          Fetching data for Tenant: {tenantId || 'None'}, Brand: {brandId || 'None'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          
          <div className="bg-white rounded border p-4 mt-4">
            <h4 className="font-medium text-gray-800 mb-2">Debug Information:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Tenant ID:</strong> {tenantId || 'null'}</div>
              <div><strong>Brand ID:</strong> {brandId || 'null'}</div>
              <div><strong>Error Type:</strong> {error.constructor.name}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <div className="text-lg font-medium mb-2">No Analytics Data</div>
          <div className="text-sm">
            No analytics data found for this brand.
          </div>
          <div className="text-xs mt-2 text-gray-400">
            Tenant: {tenantId || 'None'} | Brand: {brandId || 'None'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Debug info for development */}
      <div className="mb-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
        <strong>Debug:</strong> Tenant: {tenantId}, Brand: {brandId}, KPIs: {data.kpis.length}
      </div>

      <section id="kpis" className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.kpis.map((kpi, index) => (
            <Card key={`${kpi.title}-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{kpi.title}</CardTitle>
                <span className={`text-xs font-semibold ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.change}
                </span>
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
              {data?.marketPulse.length > 0 ? (
                <ul className="space-y-3">
                  {data.marketPulse.map((item, index) => (
                    <li key={`${item.item}-${index}`} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.item}</p>
                        <p className="text-xs text-slate-500">{item.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{item.change}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No market pulse data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Growth Levers</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.growthLevers.length > 0 ? (
                <ul className="space-y-3">
                  {data.growthLevers.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-emerald-500">{item.status}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{item.change}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No growth levers data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opportunity Radar</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.opportunityRadar.length > 0 ? (
                <ul className="space-y-4">
                  {data.opportunityRadar.map((item, index) => (
                    <li key={`${item.title}-${index}`}>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.score}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No opportunity data available</p>
              )}
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
    </div>
  );
}