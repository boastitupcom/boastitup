import { useState, useEffect, useCallback } from 'react';

// Type definitions - should be imported from a shared types package
export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  category: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export interface MetricType {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  created_at: string;
}

export interface DateDimension {
  id: number;
  date: string;
  week_start: string;
  month: number;
  quarter: number;
  year: number;
  is_business_day: boolean;
  day_of_week: number;
  month_name: string;
  quarter_name: string;
  created_at: string;
}

export interface UseDimensionsReturn {
  industries: Industry[] | null;
  platforms: Platform[] | null;
  metricTypes: MetricType[] | null;
  dates: DateDimension[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Service interface for dependency injection
export interface DimensionsService {
  getIndustries: () => Promise<Industry[]>;
  getPlatforms: () => Promise<Platform[]>;
  getMetricTypes: () => Promise<MetricType[]>;
  getFutureDates: (maxMonths?: number) => Promise<DateDimension[]>;
  getBusinessDaysOnly: (maxMonths?: number) => Promise<DateDimension[]>;
}

/**
 * Factory function to create dimension hooks with service dependency injection
 * Based on story.txt database schema specifications
 */
export const createDimensionHooks = (service: DimensionsService) => {
  /**
   * Hook for fetching all dimension/reference data needed for OKR creation
   * Based on story.txt database schema and sample data
   */
  const useDimensions = (): UseDimensionsReturn => {
    const [industries, setIndustries] = useState<Industry[] | null>(null);
    const [platforms, setPlatforms] = useState<Platform[] | null>(null);
    const [metricTypes, setMetricTypes] = useState<MetricType[] | null>(null);
    const [dates, setDates] = useState<DateDimension[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDimensions = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all dimension data in parallel
        const [industriesData, platformsData, metricTypesData, datesData] = await Promise.all([
          service.getIndustries(),
          service.getPlatforms(),
          service.getMetricTypes(),
          service.getFutureDates(12)
        ]);

        // Set the data
        setIndustries(industriesData);
        setPlatforms(platformsData);
        setMetricTypes(metricTypesData);
        setDates(datesData);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dimension data'));
      } finally {
        setIsLoading(false);
      }
    }, [service]);

    useEffect(() => {
      fetchDimensions();
    }, [fetchDimensions]);

    return {
      industries,
      platforms,
      metricTypes,
      dates,
      isLoading,
      error,
    };
  };

  /**
   * Specialized hook for just fetching industries (lighter weight)
   */
  const useIndustries = () => {
    const [industries, setIndustries] = useState<Industry[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchIndustries = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await service.getIndustries();
        setIndustries(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch industries'));
      } finally {
        setIsLoading(false);
      }
    }, [service]);

    useEffect(() => {
      fetchIndustries();
    }, [fetchIndustries]);

    return {
      industries,
      isLoading,
      error,
      refetch: fetchIndustries,
    };
  };

  /**
   * Get future dates for target date selection with smart filtering
   */
  const useFutureDates = (maxMonths: number = 12) => {
    const [dates, setDates] = useState<DateDimension[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDates = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await service.getBusinessDaysOnly(maxMonths);
        setDates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dates'));
      } finally {
        setIsLoading(false);
      }
    }, [service, maxMonths]);

    useEffect(() => {
      fetchDates();
    }, [fetchDates]);

    return {
      dates,
      isLoading,
      error,
      refetch: fetchDates,
    };
  };

  return {
    useDimensions,
    useIndustries,
    useFutureDates,
  };
};

// Default exports that throw errors to encourage service injection
export const useDimensions = (): UseDimensionsReturn => {
  throw new Error('useDimensions must be created via createDimensionHooks factory with service injection');
};

export const useIndustries = () => {
  throw new Error('useIndustries must be created via createDimensionHooks factory with service injection');
};

export const useFutureDates = (maxMonths: number = 12) => {
  throw new Error('useFutureDates must be created via createDimensionHooks factory with service injection');
};