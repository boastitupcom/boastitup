import { useQuery } from '@tanstack/react-query';
import { BrandHealthService } from '@/services/brand-health-service';
import type { AIInsight } from '@/types/brand-health.types';

export const useAIInsights = (brandId: string, tenantId: string) => {
  return useQuery<AIInsight[], Error>({
    queryKey: ['ai-insights', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchAIInsights(brandId, tenantId),
    staleTime: 0, // Always fetch fresh data as per spec
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUrgentAIInsights = (brandId: string, tenantId: string) => {
  return useQuery<AIInsight[], Error>({
    queryKey: ['urgent-ai-insights', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchUrgentAIInsights(brandId, tenantId),
    staleTime: 0,
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAIInsightsByPriority = (
  brandId: string, 
  tenantId: string, 
  priorities: string[]
) => {
  return useQuery<AIInsight[], Error>({
    queryKey: ['ai-insights-by-priority', brandId, tenantId, priorities],
    queryFn: () => BrandHealthService.fetchAIInsightsByPriority(brandId, tenantId, priorities),
    staleTime: 0,
    enabled: !!brandId && !!tenantId && priorities.length > 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAIInsightsByStatus = (
  brandId: string, 
  tenantId: string, 
  statuses: string[]
) => {
  return useQuery<AIInsight[], Error>({
    queryKey: ['ai-insights-by-status', brandId, tenantId, statuses],
    queryFn: () => BrandHealthService.fetchAIInsightsByStatus(brandId, tenantId, statuses),
    staleTime: 0,
    enabled: !!brandId && !!tenantId && statuses.length > 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAIInsightsSummary = (brandId: string, tenantId: string) => {
  const { data: insights, ...query } = useAIInsights(brandId, tenantId);

  const summary = insights ? BrandHealthService.calculateAIInsightsSummary(insights) : null;

  return {
    ...query,
    data: insights,
    summary,
  };
};