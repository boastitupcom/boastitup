import { useQuery } from '@tanstack/react-query';
import { OKRService } from '../services/okrService';

const STALE_TIME_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useCurrentPerformanceOKRs = (brandId?: string) => {
  return useQuery({
    queryKey: ['okrsCurrentPerformance', brandId],
    queryFn: () => OKRService.fetchCurrentPerformanceOKRs(brandId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!brandId, // Only run query if brandId is available
  });
};

export const useProgressSummary = (brandId?: string) => {
  return useQuery({
    queryKey: ['okrProgressSummary', brandId],
    queryFn: () => OKRService.fetchProgressSummary(brandId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!brandId,
  });
};

export const useBrandDashboardOverview = (brandId?: string) => {
  return useQuery({
    queryKey: ['brandDashboardOverview', brandId],
    queryFn: () => OKRService.fetchBrandDashboardOverview(brandId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!brandId,
  });
};

export const useOKRTrendAnalysis = (okrId?: string) => {
  return useQuery({
    queryKey: ['okrTrendAnalysis', okrId],
    queryFn: () => OKRService.fetchOKRTrendAnalysis(okrId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!okrId, // Only run if okrId is available
  });
};

export const useAttentionMetrics = (brandId?: string) => {
  return useQuery({
    queryKey: ['attentionMetrics', brandId],
    queryFn: () => OKRService.fetchAttentionMetrics(brandId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!brandId,
  });
};

export const useAIInsights = (brandId?: string) => {
  return useQuery({
    queryKey: ['aiInsights', brandId],
    queryFn: () => OKRService.fetchAIInsights(brandId!),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!brandId,
  });
};

// NEW: Enhanced hooks for the updated v_okr_performance view
export const useOKRPerformance = (params?: {
  brandId?: string;
  okrId?: string;
  title?: string;
}) => {
  return useQuery({
    queryKey: ['okrPerformance', params],
    queryFn: () => OKRService.fetchOKRPerformance(params),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!(params?.brandId || params?.okrId || params?.title),
  });
};

// Search OKRs by title
export const useOKRSearch = (title: string, brandId?: string) => {
  return useQuery({
    queryKey: ['okrSearch', title, brandId],
    queryFn: () => OKRService.fetchOKRPerformance({ title, brandId }),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!title && title.length > 2, // Only search with 3+ characters
  });
};

// Get specific OKR by ID
export const useOKRById = (okrId?: string) => {
  return useQuery({
    queryKey: ['okrById', okrId],
    queryFn: () => OKRService.fetchOKRPerformance({ okrId }),
    staleTime: STALE_TIME_MINUTES,
    enabled: !!okrId,
  });
};