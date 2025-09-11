// packages/hooks/src/competitor-intelligence/index.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CompetitorIntelligenceService } from './competitorIntelligenceService';
import type { 
  TrendingTopic, 
  CompetitorIntelligence, 
  IntelligenceInsight,
  BrandCurrency 
} from '@boastitup/types';

/**
 * Hook to fetch trending topics for a brand
 */
export const useTrendingTopics = (brandId: string) => {
  return useQuery({
    queryKey: ['trending-topics', brandId],
    queryFn: async () => {
      const response = await CompetitorIntelligenceService.fetchTrendingTopics(brandId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!brandId,
    retry: 2,
    onError: (error) => {
      console.error('Trending topics query error:', error);
    }
  });
};

/**
 * Hook to fetch competitor intelligence for a brand
 */
export const useCompetitorIntelligence = (brandId: string) => {
  return useQuery({
    queryKey: ['competitor-intelligence', brandId],
    queryFn: async () => {
      const response = await CompetitorIntelligenceService.fetchCompetitorIntelligence(brandId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!brandId,
    retry: 2,
    onError: (error) => {
      console.error('Competitor intelligence query error:', error);
    }
  });
};

/**
 * Hook to generate intelligence insights
 */
export const useIntelligenceInsights = (brandId: string, campaignType?: string) => {
  return useQuery({
    queryKey: ['intelligence-insights', brandId, campaignType],
    queryFn: async () => {
      const response = await CompetitorIntelligenceService.generateIntelligenceInsights(brandId, campaignType);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!brandId,
    retry: 1,
    onError: (error) => {
      console.error('Intelligence insights query error:', error);
    }
  });
};

/**
 * Hook to get brand currency settings
 */
export const useBrandCurrency = (brandId: string) => {
  return useQuery({
    queryKey: ['brand-currency', brandId],
    queryFn: async () => {
      const response = await CompetitorIntelligenceService.getBrandCurrency(brandId);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || { currency_code: 'USD', currency_symbol: '$' };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!brandId,
    retry: 2
  });
};

/**
 * Hook to refresh all intelligence data
 */
export const useRefreshIntelligence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ brandId, campaignType }: { brandId: string; campaignType?: string }) => {
      // Refetch all intelligence data
      const results = await Promise.allSettled([
        CompetitorIntelligenceService.fetchTrendingTopics(brandId),
        CompetitorIntelligenceService.fetchCompetitorIntelligence(brandId),
        CompetitorIntelligenceService.generateIntelligenceInsights(brandId, campaignType)
      ]);
      return results;
    },
    onSuccess: (_, { brandId, campaignType }) => {
      queryClient.invalidateQueries({ queryKey: ['trending-topics', brandId] });
      queryClient.invalidateQueries({ queryKey: ['competitor-intelligence', brandId] });
      queryClient.invalidateQueries({ queryKey: ['intelligence-insights', brandId, campaignType] });
    },
    onError: (error) => {
      console.error('Intelligence refresh error:', error);
    }
  });
};

/**
 * Combined hook for campaign setup data
 */
export const useCampaignIntelligenceData = (brandId: string, campaignType?: string) => {
  const trendingTopicsQuery = useTrendingTopics(brandId);
  const competitorIntelligenceQuery = useCompetitorIntelligence(brandId);
  const intelligenceInsightsQuery = useIntelligenceInsights(brandId, campaignType);
  const brandCurrencyQuery = useBrandCurrency(brandId);

  const isLoading = trendingTopicsQuery.isLoading || 
                   competitorIntelligenceQuery.isLoading || 
                   intelligenceInsightsQuery.isLoading || 
                   brandCurrencyQuery.isLoading;

  const hasErrors = trendingTopicsQuery.isError || 
                   competitorIntelligenceQuery.isError || 
                   intelligenceInsightsQuery.isError || 
                   brandCurrencyQuery.isError;

  return {
    trendingTopics: trendingTopicsQuery.data || [],
    competitorIntelligence: competitorIntelligenceQuery.data || [],
    intelligenceInsights: intelligenceInsightsQuery.data || [],
    brandCurrency: brandCurrencyQuery.data || { currency_code: 'USD', currency_symbol: '$' },
    isLoading,
    hasErrors,
    // Individual query states for granular error handling
    trendingTopicsError: trendingTopicsQuery.error,
    competitorIntelligenceError: competitorIntelligenceQuery.error,
    intelligenceInsightsError: intelligenceInsightsQuery.error,
    brandCurrencyError: brandCurrencyQuery.error,
    // Refetch functions
    refetchTrendingTopics: trendingTopicsQuery.refetch,
    refetchCompetitorIntelligence: competitorIntelligenceQuery.refetch,
    refetchIntelligenceInsights: intelligenceInsightsQuery.refetch,
    refetchBrandCurrency: brandCurrencyQuery.refetch
  };
};

// Export the service for direct use if needed
export { CompetitorIntelligenceService } from './competitorIntelligenceService';

// Export calculation helpers
export { 
  calculateTrendMomentum, 
  formatTrendVolume, 
  calculateCompetitiveAdvantage, 
  calculateAggregatedMetrics 
} from './competitorIntelligenceService';