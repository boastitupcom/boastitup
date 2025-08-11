'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent } from '@boastitup/ui';
import { useOKRDashboardStore } from '../../store/okrDashboardStore';
import { DashboardStats } from './DashboardStats';
import { OKRCard } from './OKRCard';
import { MetricsTable } from './MetricsTable';
import { OKRTrendChart } from './OKRTrendChart';
import { OKRFilters } from './OKRFilters';
import { AIInsights } from './AIInsights';
import { StatusDonutChart } from './StatusDonutChart';
import { EndDateBarChart } from './EndDateBarChart';
import { InsightsColumn } from './InsightsColumn';
import { OKRDebugInfo } from './OKRDebugInfo';
import { useCurrentPerformanceOKRs, useAttentionMetrics, useOKRTrendAnalysis } from '../../hooks/useOKRData';
import { useBrandStore } from '../../store/brandStore';
import { AlertTriangle, Target, BarChart3, Eye, Brain } from 'lucide-react';

export function OKRDashboard() {
  const { activeBrand } = useBrandStore();
  const { 
    activeTab, 
    setActiveTab, 
    filterCategory, 
    filterStatus, 
    searchQuery,
    selectedOKRId,
    setSelectedOKRId 
  } = useOKRDashboardStore();

  // Data queries
  const { data: currentOKRs, isLoading: isLoadingOKRs, error: okrError } = useCurrentPerformanceOKRs(activeBrand?.id);
  const { data: attentionMetrics, isLoading: isLoadingAttention } = useAttentionMetrics(activeBrand?.id);
  const { data: trendData } = useOKRTrendAnalysis(selectedOKRId);

  // Filter metrics based on current filter state
  const filteredMetrics = React.useMemo(() => {
    if (!currentOKRs) return [];
    
    return currentOKRs.filter(okr => {
      // Category filter
      if (filterCategory !== 'All' && okr.okr_category !== filterCategory) {
        return false;
      }
      
      // Status filter
      if (filterStatus !== 'All' && okr.performance_status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim() && 
          !okr.objective_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !okr.metric_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [currentOKRs, filterCategory, filterStatus, searchQuery]);

  // Calculate overview stats
  const overviewStats = React.useMemo(() => {
    const total = filteredMetrics.length;
    const statusCounts = {
      'Target Achieved': 0,
      'On Track': 0,
      'Behind': 0,
      'At Risk': 0,
      'Not Started': 0,
    };

    filteredMetrics.forEach(metric => {
      if (statusCounts.hasOwnProperty(metric.performance_status)) {
        statusCounts[metric.performance_status as keyof typeof statusCounts]++;
      }
    });

    const completionRate = total > 0 ? Math.round((statusCounts['Target Achieved'] / total) * 100) : 0;
    const atRiskCount = statusCounts['At Risk'] + statusCounts['Behind'];

    return {
      total,
      completionRate,
      onTrack: statusCounts['On Track'],
      needAttention: atRiskCount,
    };
  }, [filteredMetrics]);

  const handleOKRClick = (okr: any) => {
    setSelectedOKRId(okr.okr_id || okr.id);
    setActiveTab('Metrics');
  };

  if (isLoadingOKRs) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (okrError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">
            There was an error loading your OKR data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabConfig = [
    {
      id: 'Overview',
      label: 'Overview',
      icon: Target,
      count: filteredMetrics.length,
    },
    {
      id: 'OKRs',
      label: 'OKRs',
      icon: Target,
      count: filteredMetrics.length,
    },
    {
      id: 'Metrics',
      label: 'Metrics',
      icon: BarChart3,
      count: filteredMetrics.length,
    },
    {
      id: 'Attention',
      label: 'Attention',
      icon: AlertTriangle,
      count: attentionMetrics?.length || 0,
    },
    {
      id: 'AI Insights',
      label: 'AI Insights',
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OKR Dashboard</h1>
          <p className="text-gray-600">
            Track and monitor your Objectives and Key Results performance
          </p>
        </div>
      </div>

      <OKRFilters />

      {/* <OKRDebugInfo /> */}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
          {tabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 text-sm"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="Overview" className="space-y-6">
          {/* Two-column layout: 70% left, 30% right */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* Left Column - 7/10 width (70%) */}
            <div className="xl:col-span-7 space-y-6">
              {/* Top Row - Three KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total OKRs Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total OKRs</p>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.total}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-full">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Rate Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.completionRate}%</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-full">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* On Track Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">On Track</p>
                        <p className="text-2xl font-bold text-gray-900">{overviewStats.onTrack}</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-full">
                        <Eye className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - Two Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusDonutChart metrics={filteredMetrics} />
                <EndDateBarChart metrics={filteredMetrics} />
              </div>
            </div>

            {/* Right Column - 3/10 width (30%) */}
            <div className="xl:col-span-3">
              <InsightsColumn 
                brandId={activeBrand?.id} 
                needAttentionCount={overviewStats.needAttention}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="OKRs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((okr, index) => (
              <OKRCard 
                key={index} 
                okr={okr} 
                onClick={() => handleOKRClick(okr)}
              />
            ))}
          </div>
          
          {filteredMetrics.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No OKRs Found</h3>
                <p className="text-gray-600">
                  No OKRs match your current filter criteria. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="Metrics" className="space-y-6">
          <MetricsTable 
            metrics={filteredMetrics} 
            onMetricClick={handleOKRClick}
          />
          
          {selectedOKRId && trendData && trendData.length > 0 && (
            <OKRTrendChart 
              data={trendData} 
              title="Selected OKR Trend Analysis"
            />
          )}
        </TabsContent>

        <TabsContent value="Attention" className="space-y-6">
          {isLoadingAttention ? (
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              {attentionMetrics && attentionMetrics.length > 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Metrics Requiring Attention
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        These metrics are behind schedule or at risk and need immediate attention.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <MetricsTable 
                    metrics={attentionMetrics} 
                    onMetricClick={handleOKRClick}
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Eye className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h3>
                    <p className="text-gray-600">
                      No metrics currently require immediate attention. Keep up the great work!
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="AI Insights" className="space-y-6">
          <AIInsights brandId={activeBrand?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}