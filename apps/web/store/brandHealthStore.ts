import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { BrandHealthStore } from '../types/brand-health';

interface BrandHealthStoreState extends BrandHealthStore {
  // Additional UI state
  isRefreshing: boolean;
  
  // Filter helpers
  clearFilters: () => void;
  togglePriorityFilter: (priority: string) => void;
  toggleStatusFilter: (status: string) => void;
  
  // UI actions
  setRefreshing: (isRefreshing: boolean) => void;
}

export const useBrandHealthStore = create<BrandHealthStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedBrand: null,
        activeCategory: 'Awareness',
        filters: {
          priority: [],
          status: [],
        },
        lastRefreshed: undefined,
        isRefreshing: false,

        // Basic actions
        setSelectedBrand: (brandId: string) => {
          set(
            (state) => ({ 
              ...state, 
              selectedBrand: brandId,
              // Reset filters when switching brands
              filters: {
                priority: [],
                status: [],
              },
            }),
            false,
            'setSelectedBrand'
          );
        },

        setActiveCategory: (category: BrandHealthStoreState['activeCategory']) => {
          set(
            (state) => ({ ...state, activeCategory: category }),
            false,
            'setActiveCategory'
          );
        },

        updateFilters: (newFilters: Partial<BrandHealthStoreState['filters']>) => {
          set(
            (state) => ({
              ...state,
              filters: {
                ...state.filters,
                ...newFilters,
              },
            }),
            false,
            'updateFilters'
          );
        },

        setLastRefreshed: (date: Date) => {
          set(
            (state) => ({ ...state, lastRefreshed: date }),
            false,
            'setLastRefreshed'
          );
        },

        setRefreshing: (isRefreshing: boolean) => {
          set(
            (state) => ({ ...state, isRefreshing }),
            false,
            'setRefreshing'
          );
        },

        // Filter helpers
        clearFilters: () => {
          set(
            (state) => ({
              ...state,
              filters: {
                priority: [],
                status: [],
              },
            }),
            false,
            'clearFilters'
          );
        },

        togglePriorityFilter: (priority: string) => {
          set(
            (state) => {
              const currentPriorities = state.filters.priority;
              const updatedPriorities = currentPriorities.includes(priority)
                ? currentPriorities.filter(p => p !== priority)
                : [...currentPriorities, priority];

              return {
                ...state,
                filters: {
                  ...state.filters,
                  priority: updatedPriorities,
                },
              };
            },
            false,
            'togglePriorityFilter'
          );
        },

        toggleStatusFilter: (status: string) => {
          set(
            (state) => {
              const currentStatuses = state.filters.status;
              const updatedStatuses = currentStatuses.includes(status)
                ? currentStatuses.filter(s => s !== status)
                : [...currentStatuses, status];

              return {
                ...state,
                filters: {
                  ...state.filters,
                  status: updatedStatuses,
                },
              };
            },
            false,
            'toggleStatusFilter'
          );
        },
      }),
      {
        name: 'brand-health-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          selectedBrand: state.selectedBrand,
          activeCategory: state.activeCategory,
          // Don't persist filters or refresh state
        }),
        skipHydration: false,
      }
    ),
    {
      name: 'BrandHealthStore',
    }
  )
);

// Selector hooks for better performance
export const useSelectedBrand = () => useBrandHealthStore(state => state.selectedBrand);
export const useActiveCategory = () => useBrandHealthStore(state => state.activeCategory);
export const useFilters = () => useBrandHealthStore(state => state.filters);
export const useLastRefreshed = () => useBrandHealthStore(state => state.lastRefreshed);
export const useIsRefreshing = () => useBrandHealthStore(state => state.isRefreshing);

// Action selector hooks
export const useBrandHealthActions = () => useBrandHealthStore(state => ({
  setSelectedBrand: state.setSelectedBrand,
  setActiveCategory: state.setActiveCategory,
  updateFilters: state.updateFilters,
  setLastRefreshed: state.setLastRefreshed,
  setRefreshing: state.setRefreshing,
  clearFilters: state.clearFilters,
  togglePriorityFilter: state.togglePriorityFilter,
  toggleStatusFilter: state.toggleStatusFilter,
}));

// Combined selectors for common use cases
export const useCurrentFilters = () => {
  const filters = useFilters();
  const hasActiveFilters = filters.priority.length > 0 || filters.status.length > 0;
  
  return {
    ...filters,
    hasActiveFilters,
  };
};

export const useDashboardState = () => {
  const selectedBrand = useSelectedBrand();
  const activeCategory = useActiveCategory();
  const filters = useFilters();
  const lastRefreshed = useLastRefreshed();
  const isRefreshing = useIsRefreshing();
  
  return {
    selectedBrand,
    activeCategory,
    filters,
    lastRefreshed,
    isRefreshing,
  };
};