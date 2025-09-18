import { useQuery } from '@tanstack/react-query';
import { BrandHealthService, type BrandHealthScore } from './brandHealthService';

export const useBrandHealthScore = (brandId: string, tenantId: string) => {
  return useQuery<BrandHealthScore | null, Error>({
    queryKey: ['brand-health-score', brandId, tenantId],
    queryFn: () => BrandHealthService.fetchBrandHealthScore(brandId, tenantId),
    staleTime: 0, // Always fetch fresh data as per spec
    enabled: !!brandId && !!tenantId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};