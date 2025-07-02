// packages/hooks/src/use-analytics.ts
import { useState, useEffect } from 'react';
import { AnalyticsData } from '@boastitup/types';

export interface UseAnalyticsDataOptions {
  tenantId: string;
  brandId: string;
}

export const useAnalyticsData = (options: UseAnalyticsDataOptions) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.tenantId || !options.brandId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dummyData: AnalyticsData = {
          socialEngagement: 8427,
          conversionRate: 2.8,
          adSpendROI: 3.2,
          growthEfficiencyScore: 78,
        };
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(dummyData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [options.tenantId, options.brandId]);

  return { data, isLoading, error };
};
