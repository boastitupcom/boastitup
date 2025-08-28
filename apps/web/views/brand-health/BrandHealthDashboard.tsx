'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@boastitup/ui';
import { 
  RefreshCw, 
  Filter,
  Clock,
  AlertTriangle,
  BarChart3,
  Brain,
  X
} from 'lucide-react';
import { cn } from '@boastitup/ui';

// Components
import BrandScoreCard from '../../components/brand-health/BrandScoreCard';
import InsightCard from '../../components/brand-health/InsightCard';
import AIActionCard from '../../components/brand-health/AIActionCard';

// Hooks
import { useBrandHealthScore } from '../../hooks/use-brand-health-score';
import { useInsightsByCategory, useInsightsSummary } from '../../hooks/use-insights-by-category';
import { 
  useAIInsights,
  useAIInsightsSummary,
  useUrgentAIInsights
} from '../../hooks/use-ai-insights-brand-health';

// Store
import {
  useDashboardState,
  useBrandHealthActions,
  useCurrentFilters
} from '../../store/brandHealthStore';

// Types
import type { InsightData, AIInsight, CategoryType } from '../../types/brand-health';
import { BrandHealthService } from '../../services/brand-health-service';

interface BrandHealthDashboardProps {
  brandId: string;
  tenantId: string;
}

const PRIORITY_OPTIONS = [
  'CRITICAL PRIORITY',
  'HIGH PRIORITY', 
  'MEDIUM PRIORITY',
  'LOW PRIORITY'
];

const STATUS_OPTIONS = [
  'Unread',
  'Viewed',
  'Saved',
  'Selected for Action',
  'In Progress',
  'Completed'
];

export default function BrandHealthDashboard({ brandId, tenantId }: BrandHealthDashboardProps) {
  const queryClient = useQueryClient();
  const { 
    activeCategory, 
    lastRefreshed, 
    isRefreshing 
  } = useDashboardState();
  const { 
    setSelectedBrand, 
    setActiveCategory, 
    setLastRefreshed, 
    setRefreshing,
    clearFilters,
    togglePriorityFilter,
    toggleStatusFilter
  } = useBrandHealthActions();
  const { hasActiveFilters, priority: priorityFilters, status: statusFilters } = useCurrentFilters();

  // Data fetching hooks
  const { 
    data: brandHealthScore, 
    isLoading: scoreLoading, 
    error: scoreError 
  } = useBrandHealthScore(brandId, tenantId);
  
  const { 
    data: insights, 
    summary: insightsSummary, 
    isLoading: insightsLoading, 
    error: insightsError 
  } = useInsightsSummary(brandId, tenantId);
  
  const { 
    data: aiInsights, 
    summary: aiSummary, 
    isLoading: aiLoading, 
    error: aiError 
  } = useAIInsightsSummary(brandId, tenantId);
  
  const { 
    data: urgentInsights, 
    isLoading: urgentLoading 
  } = useUrgentAIInsights(brandId, tenantId);

  // Set brand in store
  useEffect(() => {
    if (brandId) {
      setSelectedBrand(brandId);
    }
  }, [brandId, setSelectedBrand]);

  // Group insights by category
  const insightsByCategory = useMemo(() => {
    if (!insights) return {};
    return BrandHealthService.groupInsightsByCategory(insights);
  }, [insights]);

  // Filter AI insights based on selected filters
  const filteredAIInsights = useMemo(() => {
    if (!aiInsights) return [];
    
    let filtered = aiInsights;
    
    if (priorityFilters.length > 0) {
      filtered = filtered.filter(insight => 
        priorityFilters.includes(insight.priority_display)
      );
    }
    
    if (statusFilters.length > 0) {
      filtered = filtered.filter(insight => 
        statusFilters.includes(insight.action_status)
      );
    }
    
    return filtered;
  }, [aiInsights, priorityFilters, statusFilters]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey.includes('brand-health-score') ||
            queryKey.includes('insights-by-category') ||
            queryKey.includes('ai-insights')
          ) && queryKey.includes(brandId);
        }
      });
      
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle AI insight status change
  const handleAIInsightStatusChange = (insightId: string, newStatus: AIInsight['action_status']) => {
    console.log(`Status changed for insight ${insightId}:`, newStatus);
    // In a real implementation, this would make an API call to update the status
    // For now, we'll just invalidate the queries to refetch data
    queryClient.invalidateQueries({
      queryKey: ['ai-insights', brandId, tenantId]
    });
  };

  // Loading state
  const isLoading = scoreLoading || insightsLoading || aiLoading;
  const hasErrors = scoreError || insightsError || aiError;

  if (hasErrors) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load dashboard data
            </h2>
            <p className="text-gray-600 text-center mb-4">
              There was an error loading your brand health data. Please try refreshing the page.
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Health Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights into your brand's performance across all platforms
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Last Refreshed */}
          {lastRefreshed && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                Last updated {lastRefreshed.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}
          
          {/* Refresh Button */}
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {(insightsSummary || aiSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightsSummary && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Insights</p>
                      <p className="text-2xl font-bold">{insightsSummary.total}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                      <p className="text-2xl font-bold text-red-600">{insightsSummary.critical}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {aiSummary && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI Insights</p>
                      <p className="text-2xl font-bold">{aiSummary.total}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Urgent Actions</p>
                      <p className="text-2xl font-bold text-orange-600">{aiSummary.urgent}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel - Brand Score Card */}
        <div className="lg:col-span-1">
          <BrandScoreCard
            score={brandHealthScore?.brand_health_score || 0}
            isLoading={scoreLoading}
            size="lg"
          />
        </div>

        {/* Right Panel - Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as CategoryType | 'AI Actions')}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="Awareness">Awareness</TabsTrigger>
                <TabsTrigger value="Consideration">Consider</TabsTrigger>
                <TabsTrigger value="Trust & Credibility">Trust</TabsTrigger>
                <TabsTrigger value="AI Actions">AI Actions</TabsTrigger>
              </TabsList>
              
              {/* Filters for AI Actions */}
              {activeCategory === 'AI Actions' && (
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {priorityFilters.length + statusFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Priority</DropdownMenuLabel>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <DropdownMenuItem
                          key={priority}
                          onClick={() => togglePriorityFilter(priority)}
                          className="flex items-center justify-between"
                        >
                          <span>{priority}</span>
                          {priorityFilters.includes(priority) && (
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      {STATUS_OPTIONS.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className="flex items-center justify-between"
                        >
                          <span>{status}</span>
                          {statusFilters.includes(status) && (
                            <Badge variant="secondary" className="text-xs">✓</Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Tab Contents */}
            <TabsContent value="Awareness" className="space-y-6">
              <InsightCard
                category="Awareness"
                insights={insightsByCategory['Awareness'] || []}
                isLoading={insightsLoading}
              />
            </TabsContent>

            <TabsContent value="Consideration" className="space-y-6">
              <InsightCard
                category="Consideration"
                insights={insightsByCategory['Consideration'] || []}
                isLoading={insightsLoading}
              />
            </TabsContent>

            <TabsContent value="Trust & Credibility" className="space-y-6">
              <InsightCard
                category="Trust & Credibility"
                insights={insightsByCategory['Trust & Credibility'] || []}
                isLoading={insightsLoading}
              />
            </TabsContent>

            <TabsContent value="AI Actions" className="space-y-6">
              {urgentInsights && urgentInsights.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Urgent Actions Required</span>
                      <Badge variant="destructive">{urgentInsights.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {urgentInsights.slice(0, 2).map((insight) => (
                      <AIActionCard
                        key={insight.id}
                        insight={insight}
                        onStatusChange={handleAIInsightStatusChange}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-4">
                {isLoading && (
                  <div className="text-center py-8">Loading AI insights...</div>
                )}
                
                {filteredAIInsights.length === 0 && !isLoading && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {hasActiveFilters 
                          ? 'No AI insights match your current filters' 
                          : 'No AI insights available at this time'
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {filteredAIInsights.map((insight) => (
                  <AIActionCard
                    key={insight.id}
                    insight={insight}
                    onStatusChange={handleAIInsightStatusChange}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}