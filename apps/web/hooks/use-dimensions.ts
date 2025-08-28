import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { 
  Industry, 
  Platform, 
  MetricType, 
  DateDimension, 
  UseDimensionsReturn 
} from '../types/okr-creation';

/**
 * Hook for fetching all dimension/reference data needed for OKR creation
 * Based on story.txt database schema and sample data
 */
export function useDimensions(): UseDimensionsReturn {
  const [industries, setIndustries] = useState<Industry[] | null>(null);
  const [platforms, setPlatforms] = useState<Platform[] | null>(null);
  const [metricTypes, setMetricTypes] = useState<MetricType[] | null>(null);
  const [dates, setDates] = useState<DateDimension[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchDimensions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all dimension data in parallel
      const [
        industriesResponse,
        platformsResponse,
        metricTypesResponse,
        datesResponse
      ] = await Promise.all([
        // Industries - based on sample data (lines 664-690)
        supabase
          .from('industries')
          .select('id, name, slug, description, created_at, updated_at')
          .order('name', { ascending: true }),

        // Platforms - based on sample data (lines 759-808)
        supabase
          .from('dim_platform')
          .select('id, name, category, display_name, is_active, created_at')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('display_name', { ascending: true }),

        // Metric Types - based on sample data (lines 810-881)
        supabase
          .from('dim_metric_type')
          .select('id, code, description, unit, category, created_at')
          .order('category', { ascending: true })
          .order('code', { ascending: true }),

        // Date Dimension - future dates for target selection
        supabase
          .from('dim_date')
          .select(`
            id, 
            date, 
            week_start, 
            month, 
            quarter, 
            year, 
            is_business_day, 
            day_of_week, 
            month_name, 
            quarter_name, 
            created_at
          `)
          .gte('date', new Date().toISOString().split('T')[0]) // Future dates only
          .lte('date', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Next 12 months
          .order('date', { ascending: true })
          .limit(365)
      ]);

      // Check for errors
      if (industriesResponse.error) {
        throw new Error(`Industries fetch failed: ${industriesResponse.error.message}`);
      }
      if (platformsResponse.error) {
        throw new Error(`Platforms fetch failed: ${platformsResponse.error.message}`);
      }
      if (metricTypesResponse.error) {
        throw new Error(`Metric types fetch failed: ${metricTypesResponse.error.message}`);
      }
      if (datesResponse.error) {
        throw new Error(`Dates fetch failed: ${datesResponse.error.message}`);
      }

      // Set the data
      setIndustries(industriesResponse.data || []);
      setPlatforms(platformsResponse.data || []);
      setMetricTypes(metricTypesResponse.data || []);
      setDates(datesResponse.data || []);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dimension data'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

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
}

/**
 * Specialized hook for just fetching industries (lighter weight)
 */
export function useIndustries() {
  const [industries, setIndustries] = useState<Industry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchIndustries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('industries')
        .select('id, name, slug, description')
        .order('name', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setIndustries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch industries'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  return {
    industries,
    isLoading,
    error,
    refetch: fetchIndustries,
  };
}

/**
 * Get future dates for target date selection with smart filtering
 */
export function useFutureDates(maxMonths: number = 12) {
  const [dates, setDates] = useState<DateDimension[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchDates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + maxMonths);

      const { data, error: supabaseError } = await supabase
        .from('dim_date')
        .select('id, date, month_name, quarter_name, year, quarter, is_business_day')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .eq('is_business_day', true) // Only business days for OKR targets
        .order('date', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setDates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dates'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, maxMonths]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  return {
    dates,
    isLoading,
    error,
    refetch: fetchDates,
  };
}