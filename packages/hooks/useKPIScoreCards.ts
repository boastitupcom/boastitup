// packages/hooks/useKPIScoreCards.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import type { KPIScorecard } from '@boastitup/types';

interface UseKPIScoreCardsOptions {
  organizationId?: string;
  categories?: string[];
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface UseKPIScoreCardsReturn {
  kpis: KPIScorecard[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filters: {
    categories: string[];
  };
  setFilters: (filters: { categories: string[] }) => void;
  lastUpdated: Date | null;
}

export function useKPIScoreCards(options: UseKPIScoreCardsOptions = {}): UseKPIScoreCardsReturn {
  const { 
    organizationId, 
    categories = [], 
    refreshInterval = 30000, 
    autoRefresh = true 
  } = options;
  
  const [kpis, setKpis] = useState<KPIScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({ categories });
  
  const supabase = createClient();

  const fetchKPIData = useCallback(async () => {
    try {
      setError(null);
      
      if (!organizationId) {
        console.warn('No organization ID provided for KPI data fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching KPI data for organization:', organizationId, 'categories:', filters.categories);

      // Build the query for KPI scorecards
      let query = supabase
        .from('view_kpi_scorecards')
        .select(`
          id,
          name,
          display_name,
          category,
          current_value,
          target_value,
          previous_value,
          progress_percentage,
          change_amount,
          change_percentage,
          status,
          trend_direction,
          unit_type,
          alert_level,
          measurement_date
        `)
        .eq('organization_id', organizationId)
        .order('category')
        .order('display_name');

      // Apply category filters if specified
      if (filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setKpis(data || []);
      setLastUpdated(new Date());
      
      console.log('KPI data fetched successfully:', (data || []).length, 'items');
      
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters.categories, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(fetchKPIData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchKPIData, autoRefresh, refreshInterval]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchKPIData();
  }, [fetchKPIData]);

  const updateFilters = useCallback((newFilters: { categories: string[] }) => {
    setFilters(newFilters);
  }, []);

  return {
    kpis,
    loading,
    error,
    refresh,
    filters,
    setFilters: updateFilters,
    lastUpdated,
  };
}