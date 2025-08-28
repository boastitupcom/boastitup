"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import { 
  OKRTemplate, 
  Industry, 
  Platform, 
  MetricType, 
  DateDimension,
  ManagedOKR,
  CreateOKRInput,
  OKRUpdateInput,
  BulkOKRManagementOperation
} from '../types/okr-creation';

// Query Keys for React Query
export const OKR_QUERY_KEYS = {
  templates: (industrySlug?: string) => ['okr-templates', industrySlug],
  dimensions: () => ['okr-dimensions'],
  industries: () => ['industries'],
  platforms: () => ['platforms'],
  metricTypes: () => ['metric-types'],
  dates: () => ['dates'],
  managedOKRs: (brandId: string, filters?: any) => ['managed-okrs', brandId, filters],
  okrById: (id: string) => ['okr', id],
  okrStats: (brandId: string) => ['okr-stats', brandId]
} as const;

// Cache time constants (in milliseconds) - Following story.txt line 449
const CACHE_TIME = {
  SHORT: 5 * 60 * 1000,    // 5 minutes - React Query stale-while-revalidate
  MEDIUM: 15 * 60 * 1000,   // 15 minutes  
  LONG: 60 * 60 * 1000,     // 1 hour
  STATIC: 24 * 60 * 60 * 1000  // 24 hours (for dimensions)
};

// Optimized OKR Templates Query
export function useOKRTemplatesQuery(industrySlug?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: OKR_QUERY_KEYS.templates(industrySlug),
    queryFn: async (): Promise<OKRTemplate[]> => {
      if (!industrySlug) return [];

      const { data, error } = await supabase
        .from('okr_master')
        .select(`
          id,
          objective_title,
          objective_description,
          category,
          priority_level,
          suggested_timeframe,
          industry,
          is_active
        `)
        .eq('industry', industrySlug)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        okrMasterId: row.id,
        title: row.objective_title,
        description: row.objective_description,
        category: row.category,
        priority: row.priority_level,
        suggestedTimeframe: row.suggested_timeframe as any,
        applicablePlatforms: [],
        metricTypeId: '',
        confidenceScore: 1.0,
        reasoning: ''
      }));
    },
    enabled: !!industrySlug,
    staleTime: CACHE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG
  });
}

// Optimized Dimensions Query
export function useDimensionsQuery() {
  const supabase = createClient();

  const industriesQuery = useQuery({
    queryKey: OKR_QUERY_KEYS.industries(),
    queryFn: async (): Promise<Industry[]> => {
      const { data, error } = await supabase
        .from('industries')
        .select('id, name, slug, description')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC
  });

  const platformsQuery = useQuery({
    queryKey: OKR_QUERY_KEYS.platforms(),
    queryFn: async (): Promise<Platform[]> => {
      const { data, error } = await supabase
        .from('dim_platform')
        .select('id, name, display_name, category')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC
  });

  const metricTypesQuery = useQuery({
    queryKey: OKR_QUERY_KEYS.metricTypes(),
    queryFn: async (): Promise<MetricType[]> => {
      const { data, error } = await supabase
        .from('dim_metric_type')
        .select('id, code, description, category, unit')
        .order('description');

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC
  });

  const datesQuery = useQuery({
    queryKey: OKR_QUERY_KEYS.dates(),
    queryFn: async (): Promise<DateDimension[]> => {
      const { data, error } = await supabase
        .from('dim_date')
        .select('id, date, year, month, month_name, quarter_name, is_business_day')
        .eq('is_business_day', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .limit(90);

      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.STATIC
  });

  return {
    industries: industriesQuery.data,
    platforms: platformsQuery.data,
    metricTypes: metricTypesQuery.data,
    dates: datesQuery.data,
    isLoading: industriesQuery.isLoading || platformsQuery.isLoading || 
               metricTypesQuery.isLoading || datesQuery.isLoading,
    error: industriesQuery.error || platformsQuery.error || 
           metricTypesQuery.error || datesQuery.error
  };
}

// Managed OKRs Query with Filters
export function useManagedOKRsQuery(brandId: string, filters?: {
  search?: string;
  status?: string;
  priority?: string;
}) {
  const supabase = createClient();

  return useQuery({
    queryKey: OKR_QUERY_KEYS.managedOKRs(brandId, filters),
    queryFn: async (): Promise<ManagedOKR[]> => {
      let query = supabase
        .from('okr_objectives')
        .select(`
          id,
          title,
          description,
          target_value,
          current_value,
          status,
          priority,
          granularity,
          created_at,
          target_date_id,
          platform_id,
          metric_type_id,
          okr_master_id,
          master_template_id,
          dim_date!okr_objectives_target_date_id_fkey(
            id,
            date,
            month_name,
            year,
            quarter_name
          ),
          dim_platform(
            id,
            name,
            display_name,
            category
          ),
          dim_metric_type(
            id,
            code,
            description,
            category,
            unit
          ),
          okr_master(
            id,
            title,
            description,
            category
          )
        `)
        .eq('brand_id', brandId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', parseInt(filters.priority));
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as ManagedOKR[] || [];
    },
    enabled: !!brandId,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM
  });
}

// OKR Stats Query
export function useOKRStatsQuery(brandId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: OKR_QUERY_KEYS.okrStats(brandId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_objectives')
        .select('status, priority')
        .eq('brand_id', brandId);

      if (error) throw error;

      const stats = data || [];
      return {
        total: stats.length,
        active: stats.filter(s => s.status === 'active').length,
        completed: stats.filter(s => s.status === 'completed').length,
        highPriority: stats.filter(s => s.priority === 1).length
      };
    },
    enabled: !!brandId,
    staleTime: CACHE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM
  });
}

// Create OKRs Mutation with Optimistic Updates
export function useCreateOKRsMutation(brandId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CreateOKRInput) => {
      const { data, error } = await supabase
        .from('okr_objectives')
        .insert(
          input.objectives.map(obj => ({
            tenant_id: input.tenantId,
            brand_id: input.brandId,
            title: obj.title,
            description: obj.description,
            target_value: obj.targetValue,
            granularity: obj.granularity,
            target_date_id: obj.targetDateId,
            platform_id: obj.platformId,
            metric_type_id: obj.metricTypeId,
            is_active: true
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.managedOKRs(brandId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.okrStats(brandId) 
      });
    },
    onError: (error) => {
      console.error('Failed to create OKRs:', error);
    }
  });
}

// Update OKR Mutation with Optimistic Updates
export function useUpdateOKRMutation(brandId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OKRUpdateInput }) => {
      const { data, error } = await supabase
        .from('okr_objectives')
        .update({
          ...updates
        })
        .eq('id', id)
        .eq('brand_id', brandId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: OKR_QUERY_KEYS.managedOKRs(brandId) 
      });
      
      // Snapshot the previous value
      const previousOKRs = queryClient.getQueryData(OKR_QUERY_KEYS.managedOKRs(brandId));
      
      // Optimistically update
      queryClient.setQueryData(
        OKR_QUERY_KEYS.managedOKRs(brandId), 
        (old: ManagedOKR[] | undefined) => {
          if (!old) return old;
          return old.map(okr => 
            okr.id === id ? { ...okr, ...updates } : okr
          );
        }
      );
      
      return { previousOKRs };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOKRs) {
        queryClient.setQueryData(
          OKR_QUERY_KEYS.managedOKRs(brandId),
          context.previousOKRs
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.managedOKRs(brandId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.okrStats(brandId) 
      });
    }
  });
}

// Bulk Operations Mutation
export function useBulkOKRMutation(brandId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (operation: BulkOKRManagementOperation) => {
      let updateData: any = { 
        ...operation.data 
      };

      switch (operation.operation) {
        case 'archive':
        case 'delete':
          updateData.is_active = false;
          break;
        case 'activate':
          updateData.is_active = true;
          break;
        case 'pause':
          updateData.is_active = false;
          break;
      }

      const { data, error } = await supabase
        .from('okr_objectives')
        .update(updateData)
        .in('id', operation.okrIds)
        .eq('brand_id', brandId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.managedOKRs(brandId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: OKR_QUERY_KEYS.okrStats(brandId) 
      });
    }
  });
}

// Prefetch utilities
export function usePrefetchOKRData() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const prefetchTemplates = (industrySlug: string) => {
    queryClient.prefetchQuery({
      queryKey: OKR_QUERY_KEYS.templates(industrySlug),
      queryFn: () => {
        // Implementation matches useOKRTemplatesQuery
      },
      staleTime: CACHE_TIME.MEDIUM
    });
  };

  const prefetchDimensions = () => {
    queryClient.prefetchQuery({
      queryKey: OKR_QUERY_KEYS.dimensions(),
      queryFn: () => {
        // Implementation matches useDimensionsQuery
      },
      staleTime: CACHE_TIME.STATIC
    });
  };

  return {
    prefetchTemplates,
    prefetchDimensions
  };
}