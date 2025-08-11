// packages/hooks/useDashboardFilters.ts
import { useState, useCallback, useEffect } from 'react';
import type { DashboardFilters } from '@boastitup/types';

interface UseDashboardFiltersReturn {
  filters: DashboardFilters;
  updateFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
  activeFilters: {
    hasDateFilter: boolean;
    hasCategoryFilter: boolean;
    hasSegmentFilter: boolean;
    totalActive: number;
  };
}

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  },
  categories: [],
  segments: [],
};

const STORAGE_KEY = 'dashboard-filters';

export function useDashboardFilters(): UseDashboardFiltersReturn {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedFilters = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsedFilters.dateRange.start = new Date(parsedFilters.dateRange.start);
        parsedFilters.dateRange.end = new Date(parsedFilters.dateRange.end);
        setFilters(parsedFilters);
      }
    } catch (error) {
      console.warn('Failed to load dashboard filters from localStorage:', error);
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save dashboard filters to localStorage:', error);
    }
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof DashboardFilters>(
    key: K, 
    value: DashboardFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Calculate active filters
  const activeFilters = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const hasDateFilter = 
      filters.dateRange.start.getTime() !== thirtyDaysAgo.getTime() ||
      Math.abs(filters.dateRange.end.getTime() - now.getTime()) > 24 * 60 * 60 * 1000; // More than 1 day difference
    
    const hasCategoryFilter = filters.categories.length > 0;
    const hasSegmentFilter = filters.segments.length > 0;
    
    const totalActive = [hasDateFilter, hasCategoryFilter, hasSegmentFilter].filter(Boolean).length;

    return {
      hasDateFilter,
      hasCategoryFilter,
      hasSegmentFilter,
      totalActive,
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    activeFilters: activeFilters(),
  };
}