import { useQuery } from '@tanstack/react-query';
import { BrandHealthService } from '@/services/brand-health-service';
import type { InsightData } from '@/types/brand-health.types';

export const useInsightsByCategory = (brandId: string, tenantId: string) => {
  return useQuery<InsightData[], Error>({
    queryKey: ['insights-by-category', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchInsightsByCategory(brandId, tenantId),
    staleTime: 0, // Always fetch fresh data as per spec
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => {
      // Group insights by category and sort by display_order
      return data.sort((a, b) => {
        if (a.category === b.category) {
          return a.display_order - b.display_order;
        }
        return a.category.localeCompare(b.category);
      });
    },
  });
};

export const useInsightsBySpecificCategory = (
  brandId: string, 
  tenantId: string, 
  category: string
) => {
  return useQuery<InsightData[], Error>({
    queryKey: ['insights-by-specific-category', brandId, tenantId, category],
    queryFn: () => BrandHealthService.fetchInsightsBySpecificCategory(brandId, tenantId, category),
    staleTime: 0,
    enabled: !!brandId && !!tenantId && !!category,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useInsightsSummary = (brandId: string, tenantId: string) => {
  const { data: insights, ...query } = useInsightsByCategory(brandId, tenantId);

  const summary = insights ? BrandHealthService.calculateInsightsSummary(insights) : null;

  return {
    ...query,
    data: insights,
    summary,
  };
};