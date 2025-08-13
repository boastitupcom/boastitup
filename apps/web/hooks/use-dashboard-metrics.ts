import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { DashboardMetric, UseDashboardMetricsReturn } from '../types/okr';

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetric[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('v_dashboard_metric_cards_complete')
        .select('*');

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const refresh = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
}