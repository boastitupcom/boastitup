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
  X,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import BrandScoreCard from '../../components/brand-health/BrandScoreCard';
import CategoryCard from '../../components/brand-health/CategoryCard';

// New Hooks
import { 
  useBrandHealthScore,
  useInsightsWithActions,
  useCategoryInsights,
  useUrgentActions,
  useBrandHealthSummary,
  useUpdateActionStage
} from '../../hooks/use-brand-health-v2';

// Store
import {
  useDashboardState,
  useBrandHealthActions,
  useCurrentFilters
} from '../../store/brandHealthStore';

// Types
import type { ActionStage } from '../../types/brand-health';
import { getGridColumns } from '../../types/brand-health';

interface BrandHealthDashboardProps {
  brandId: string;
  tenantId: string;
  userId: string;
}

export default function BrandHealthDashboard({ brandId, tenantId, userId }: BrandHealthDashboardProps) {
  const queryClient = useQueryClient();
  const { 
    lastRefreshed, 
    isRefreshing 
  } = useDashboardState();
  const { 
    setSelectedBrand, 
    setLastRefreshed, 
    setRefreshing,
    clearFilters
  } = useBrandHealthActions();

  // New data fetching hooks
  const { 
    data: brandHealthScore, 
    isLoading: scoreLoading, 
    error: scoreError 
  } = useBrandHealthScore(brandId, tenantId);
  
  const { 
    data: categoryInsights, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useCategoryInsights(brandId, tenantId);
  
  const { 
    data: urgentActions, 
    isLoading: urgentLoading 
  } = useUrgentActions(brandId, tenantId);
  
  const { 
    summary: healthSummary, 
    isLoading: summaryLoading 
  } = useBrandHealthSummary(brandId, tenantId);

  // Action mutation hook
  const updateActionStageMutation = useUpdateActionStage();

  // Set brand in store
  useEffect(() => {
    if (brandId) {
      setSelectedBrand(brandId);
    }
  }, [brandId, setSelectedBrand]);

  // Dynamic grid columns based on category count - matches specs exactly
  const gridColumns = useMemo(() => {
    if (!categoryInsights) return 'grid-cols-1';
    return getGridColumns(categoryInsights.length);
  }, [categoryInsights]);

  // Debug log for grid system
  console.log('Category count:', categoryInsights?.length, 'Grid classes:', gridColumns);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey.includes('brand-health-score') ||
            queryKey.includes('insights-with-actions')
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

  // Handle action stage change
  const handleActionStageChange = async (actionId: string, newStage: ActionStage) => {
    try {
      await updateActionStageMutation.mutateAsync({
        actionId,
        stage: newStage,
        userId
      });
    } catch (error) {
      console.error('Error updating action stage:', error);
      // Handle error (show toast, etc.)
    }
  };

  // Loading state
  const isLoading = scoreLoading || categoryLoading || summaryLoading;
  const hasErrors = scoreError || categoryError;

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

      {/* Summary Cards - 1x4 Grid */}
      {healthSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Insights</p>
                  <p className="text-2xl font-bold">{healthSummary.totalInsights}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Actions</p>
                  <p className="text-2xl font-bold">{healthSummary.totalActions}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Actions</p>
                  <p className="text-2xl font-bold text-blue-600">{healthSummary.newActions}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Actions</p>
                  <p className="text-2xl font-bold text-red-600">{healthSummary.urgentActions}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Layout - New Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel - Brand Score Card */}
        <div className="lg:col-span-1">
          <BrandScoreCard
            score={brandHealthScore?.brand_health_score || 0}
            isLoading={scoreLoading}
            size="lg"
          />
        </div>

        {/* Right Panel - Dynamic Category Grid (matches latest.txt specs) */}
        <div className="lg:col-span-3">
          {/* Dynamic Grid Layout for Categories */}
          {categoryInsights && categoryInsights.length > 0 ? (
            <div className="space-y-6">
              {/* Debug info for development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                  Grid: {categoryInsights.length} categories → {gridColumns}
                </div>
              )}
              
              <div className={cn("grid gap-6", gridColumns)}>
                {categoryInsights.map((categoryData) => (
                  <CategoryCard
                    key={categoryData.category}
                    category={categoryData.category}
                    insights={categoryData.insights}
                    isLoading={categoryLoading}
                    onActionStageChange={handleActionStageChange}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div>Loading insights...</div>
                </div>
              ) : (
                <div>
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No insights available at this time</p>
                </div>
              )}
            </div>
          )}

          {/* Urgent Actions Section */}
          {urgentActions && urgentActions.length > 0 && (
            <div className="mt-8">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Urgent Actions Required</span>
                    <Badge variant="destructive">{urgentActions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-red-600 mb-4">
                    These actions require immediate attention due to high impact scores (8+).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {urgentActions.slice(0, 4).map((action) => (
                      <div key={action.id} className="bg-white rounded-lg border border-red-200 p-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">{action.action_text}</h5>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="destructive">Impact: {action.action_impact_score}/10</Badge>
                            <Badge variant="outline">{action.action_priority}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleActionStageChange(action.id, 'viewed')}
                            className="w-full"
                          >
                            Review Action
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {urgentActions.length > 4 && (
                    <p className="text-xs text-red-600 text-center mt-4">
                      + {urgentActions.length - 4} more urgent actions
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}