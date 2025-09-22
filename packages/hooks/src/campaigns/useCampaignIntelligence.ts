import { useQuery } from '@tanstack/react-query';
import { CampaignIntelligenceService, type CampaignIntelligence } from './CampaignIntelligenceService';

export const useCampaignIntelligence = (brandId: string, campaignType?: string, productId?: string) => {
  return useQuery({
    queryKey: ['campaign-intelligence', brandId, campaignType, productId],
    queryFn: () => CampaignIntelligenceService.getIntelligence(brandId, campaignType, productId),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useBrandProducts = (brandId: string) => {
  return useQuery({
    queryKey: ['brand-products', brandId],
    queryFn: () => CampaignIntelligenceService.getBrandProducts(brandId),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!brandId
  });
};