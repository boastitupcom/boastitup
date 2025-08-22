import { useQuery } from '@tanstack/react-query';

const STALE_TIME_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

// Note: This will need to import OKRService from the app layer
// For now, we'll expect it to be passed or injected
export interface OKRServiceInterface {
  fetchCurrentPerformanceOKRs: (brandId: string) => Promise<any>;
  fetchProgressSummary: (brandId: string) => Promise<any>;
  fetchBrandDashboardOverview: (brandId: string) => Promise<any>;
  fetchOKRTrendAnalysis: (okrId: string) => Promise<any>;
  fetchAttentionMetrics: (brandId: string) => Promise<any>;
  fetchAIInsights: (brandId: string) => Promise<any>;
  fetchOKRPerformance: (params?: {
    brandId?: string;
    okrId?: string;
    title?: string;
  }) => Promise<any>;
  fetchOKRTemplates: (industrySlug?: string) => Promise<any>;
}

// Factory function to create hooks with service dependency
export const createOKRDataHooks = (okrService: OKRServiceInterface) => {
  const useCurrentPerformanceOKRs = (brandId?: string) => {
    return useQuery({
      queryKey: ['okrsCurrentPerformance', brandId],
      queryFn: () => okrService.fetchCurrentPerformanceOKRs(brandId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!brandId, // Only run query if brandId is available
    });
  };

  const useProgressSummary = (brandId?: string) => {
    return useQuery({
      queryKey: ['okrProgressSummary', brandId],
      queryFn: () => okrService.fetchProgressSummary(brandId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!brandId,
    });
  };

  const useBrandDashboardOverview = (brandId?: string) => {
    return useQuery({
      queryKey: ['brandDashboardOverview', brandId],
      queryFn: () => okrService.fetchBrandDashboardOverview(brandId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!brandId,
    });
  };

  const useOKRTrendAnalysis = (okrId?: string) => {
    return useQuery({
      queryKey: ['okrTrendAnalysis', okrId],
      queryFn: () => okrService.fetchOKRTrendAnalysis(okrId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!okrId, // Only run if okrId is available
    });
  };

  const useAttentionMetrics = (brandId?: string) => {
    return useQuery({
      queryKey: ['attentionMetrics', brandId],
      queryFn: () => okrService.fetchAttentionMetrics(brandId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!brandId,
    });
  };

  const useAIInsights = (brandId?: string) => {
    return useQuery({
      queryKey: ['aiInsights', brandId],
      queryFn: () => okrService.fetchAIInsights(brandId!),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!brandId,
    });
  };

  // NEW: Enhanced hooks for the updated v_okr_performance view
  const useOKRPerformance = (params?: {
    brandId?: string;
    okrId?: string;
    title?: string;
  }) => {
    return useQuery({
      queryKey: ['okrPerformance', params],
      queryFn: () => okrService.fetchOKRPerformance(params),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!(params?.brandId || params?.okrId || params?.title),
    });
  };

  // Search OKRs by title
  const useOKRSearch = (title: string, brandId?: string) => {
    return useQuery({
      queryKey: ['okrSearch', title, brandId],
      queryFn: () => okrService.fetchOKRPerformance({ title, brandId }),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!title && title.length > 2, // Only search with 3+ characters
    });
  };

  // Get specific OKR by ID
  const useOKRById = (okrId?: string) => {
    return useQuery({
      queryKey: ['okrById', okrId],
      queryFn: () => okrService.fetchOKRPerformance({ okrId }),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!okrId,
    });
  };

  const useOKRTemplates = (industrySlug?: string) => {
    return useQuery({
      queryKey: ['okrTemplates', industrySlug],
      queryFn: () => okrService.fetchOKRTemplates(industrySlug),
      staleTime: STALE_TIME_MINUTES,
      enabled: !!industrySlug,
    });
  };

  return {
    useCurrentPerformanceOKRs,
    useProgressSummary,
    useBrandDashboardOverview,
    useOKRTrendAnalysis,
    useAttentionMetrics,
    useAIInsights,
    useOKRPerformance,
    useOKRSearch,
    useOKRById,
    useOKRTemplates,
  };
};

// Direct exports for backward compatibility (will need service import)
export const useCurrentPerformanceOKRs = (brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useProgressSummary = (brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useBrandDashboardOverview = (brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useOKRTrendAnalysis = (okrId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useAttentionMetrics = (brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useAIInsights = (brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useOKRPerformance = (params?: {
  brandId?: string;
  okrId?: string;
  title?: string;
}) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useOKRSearch = (title: string, brandId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useOKRById = (okrId?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};

export const useOKRTemplates = (industrySlug?: string) => {
  throw new Error('This hook needs to be created via createOKRDataHooks factory with service injection');
};