import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { OKRTemplate, OKRMaster, UseOKRTemplatesReturn } from '../types/okr-creation';

/**
 * Hook for fetching OKR templates from okr_master table filtered by industry
 * Based on story.txt specifications and sample data
 */
export function useOKRTemplates(industrySlug?: string): UseOKRTemplatesReturn {
  const [templates, setTemplates] = useState<OKRTemplate[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const transformToTemplate = (master: OKRMaster): OKRTemplate => {
    return {
      id: master.id,
      okrMasterId: master.id,
      title: master.objective_title,
      description: master.objective_description || '',
      category: master.category,
      priority: master.priority_level,
      suggestedTargetValue: 0, // Will be customized by user
      suggestedTimeframe: master.suggested_timeframe as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'quarterly',
      applicablePlatforms: [], // Will be loaded from okr_master_metrics
      metricTypeId: '', // Will be loaded from okr_master_metrics
      confidenceScore: 0.85, // Default confidence
      reasoning: `Suggested for ${master.industry} industry in ${master.category} category`
    };
  };

  const fetchTemplates = useCallback(async () => {
    if (!industrySlug) {
      setTemplates([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Query okr_master table filtered by industry
      // Based on sample data structure from story.txt (lines 692-757)
      const { data: masterData, error: masterError } = await supabase
        .from('okr_master')
        .select(`
          id,
          industry,
          category,
          objective_title,
          objective_description,
          suggested_timeframe,
          priority_level,
          is_active,
          tags
        `)
        .eq('industry', industrySlug)
        .eq('is_active', true)
        .order('priority_level', { ascending: true })
        .order('category', { ascending: true });

      if (masterError) {
        throw new Error(masterError.message);
      }

      if (!masterData || masterData.length === 0) {
        setTemplates([]);
        return;
      }

      // Get metric types for each template from okr_master_metrics
      const masterIds = masterData.map(m => m.id);
      const { data: metricsData, error: metricsError } = await supabase
        .from('okr_master_metrics')
        .select(`
          okr_master_id,
          metric_type_id,
          is_primary,
          target_improvement_percentage,
          weight,
          dim_metric_type!inner (
            id,
            code,
            description,
            unit,
            category
          )
        `)
        .in('okr_master_id', masterIds);

      if (metricsError) {
        console.warn('Failed to load metric types:', metricsError.message);
        // Continue without metric types - they can be selected later
      }

      // Transform to OKRTemplate format
      const templatesWithMetrics = masterData.map(master => {
        const template = transformToTemplate(master);
        
        // Find primary metric type for this template
        const primaryMetric = metricsData?.find(
          m => m.okr_master_id === master.id && m.is_primary
        );
        
        if (primaryMetric) {
          template.metricTypeId = primaryMetric.metric_type_id;
          template.suggestedTargetValue = primaryMetric.target_improvement_percentage || 10;
        }

        return template;
      });

      setTemplates(templatesWithMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch OKR templates'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, industrySlug]);

  const refetch = useCallback(async () => {
    await fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    refetch,
  };
}