import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandHealthService } from '../services/brand-health-service';
import { createClient } from '@boastitup/supabase/client';
import type { 
  BrandHealthScore, 
  InsightWithActions, 
  RecommendedActionV1, 
  ActionStage,
  CategoryInsights
} from '../types/brand-health';

// Brand Health Score Hook
export const useBrandHealthScore = (brandId: string, tenantId: string) => {
  return useQuery<BrandHealthScore | null, Error>({
    queryKey: ['brand-health-score', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchBrandHealthScore(brandId, tenantId),
    staleTime: 0, // Always fetch fresh data as per spec
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Main Insights Hook - NEW PRIMARY HOOK
export const useInsightsWithActions = (brandId: string, tenantId: string) => {
  return useQuery<InsightWithActions[], Error>({
    queryKey: ['insights-with-actions', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchInsightsWithActions(brandId, tenantId),
    staleTime: 0, // Always fetch fresh data as per spec
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Category Insights Hook - Grouped and computed
export const useCategoryInsights = (brandId: string, tenantId: string) => {
  const { data: insights, ...query } = useInsightsWithActions(brandId, tenantId);
  
  const categoryInsights = insights ? BrandHealthService.getCategoryInsights(insights) : [];
  
  return {
    ...query,
    data: categoryInsights,
    insights: insights || [],
  };
};

// Urgent Actions Hook
export const useUrgentActions = (brandId: string, tenantId: string) => {
  const { data: insights, ...query } = useInsightsWithActions(brandId, tenantId);
  
  const urgentActions = insights ? BrandHealthService.getUrgentActions(insights) : [];
  
  return {
    ...query,
    data: urgentActions,
  };
};

// Action Stage Update Mutation
export const useUpdateActionStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RecommendedActionV1, Error, { actionId: string; stage: ActionStage; userId: string }>({
    mutationFn: ({ actionId, stage, userId }) => 
      BrandHealthService.updateActionStage(actionId, stage, userId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch insights data
      queryClient.invalidateQueries({ 
        queryKey: ['insights-with-actions'] 
      });
      
      // Optimistically update the cache if needed
      queryClient.setQueryData(['insights-with-actions'], (old: InsightWithActions[] | undefined) => {
        if (!old) return old;
        
        return old.map(insight => ({
          ...insight,
          ai_recommended_actions_v1: insight.ai_recommended_actions_v1.map(action =>
            action.id === variables.actionId 
              ? { ...action, stage: variables.stage }
              : action
          )
        }));
      });
    },
    onError: (error) => {
      console.error('Error updating action stage:', error);
    }
  });
};

// OKR Link Mutation
export const useLinkActionToOKR = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RecommendedActionV1, Error, { actionId: string; okrObjectiveId: string }>({
    mutationFn: ({ actionId, okrObjectiveId }) => 
      BrandHealthService.linkActionToOKR(actionId, okrObjectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['insights-with-actions'] 
      });
    },
  });
};

// Campaign Assignment Mutation
export const useAssignActionToCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RecommendedActionV1, Error, { actionId: string; campaignId: string }>({
    mutationFn: ({ actionId, campaignId }) => 
      BrandHealthService.assignActionToCampaign(actionId, campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['insights-with-actions'] 
      });
    },
  });
};

// Summary Statistics Hook
export const useBrandHealthSummary = (brandId: string, tenantId: string) => {
  const { data: categoryInsights, isLoading, error } = useCategoryInsights(brandId, tenantId);
  
  if (isLoading || error || !categoryInsights) {
    return { isLoading, error, summary: null };
  }
  
  const summary = {
    totalCategories: categoryInsights.length,
    totalInsights: categoryInsights.reduce((sum, cat) => sum + cat.insights.length, 0),
    totalActions: categoryInsights.reduce((sum, cat) => sum + cat.totalActions, 0),
    newActions: categoryInsights.reduce((sum, cat) => sum + cat.newActions, 0),
    urgentActions: categoryInsights.reduce((sum, cat) => sum + cat.urgentActions, 0),
  };
  
  return { isLoading, error, summary };
};

// Real-time subscription hook (if needed in future)
export const useInsightsSubscription = (brandId: string, tenantId: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  // This would set up real-time subscriptions to ai_insights_v1 and ai_recommended_actions_v1
  // For now, we'll use manual refresh as per spec
  return {
    subscribe: () => {
      // Future implementation for real-time updates
      console.log('Real-time subscriptions not implemented yet');
    },
    unsubscribe: () => {
      // Future implementation
      console.log('Unsubscribing from real-time updates');
    }
  };
};