import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { 
  OKRTemplate, 
  OKRMaster, 
  UseOKRTemplatesReturn, 
  TemplateDebugInfo, 
  TemplateLoadingState 
} from '../types/okr-creation';
import { performanceMonitor } from '../utils/performance-monitor';
import { errorLogger } from '../utils/error-logger';

/**
 * Enhanced hook for fetching OKR templates with comprehensive debugging and fallback strategies
 * Based on story.txt specifications and sample data
 */
export function useOKRTemplates(industrySlug?: string): UseOKRTemplatesReturn {
  const [templates, setTemplates] = useState<OKRTemplate[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [debugInfo, setDebugInfo] = useState<TemplateDebugInfo | null>(null);
  const [loadingState, setLoadingState] = useState<TemplateLoadingState>({
    isLoading: false,
    hasError: false,
    errorMessage: null,
    debugInfo: null,
    fallbackAttempted: false,
    retryCount: 0
  });

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
    const startTime = performance.now();
    
    // Start performance tracking
    const performanceId = performanceMonitor.trackTemplateLoading(
      industrySlug, 
      0, // Will be updated when we get results
      'exact_match', // Will be updated based on actual method used
      false // Will be updated if fallback is used
    );
    
    try {
      setIsLoading(true);
      setError(null);
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        errorMessage: null,
        retryCount: prev.retryCount + 1
      }));

      console.log(`[useOKRTemplates] 🔍 Starting template fetch for industry slug: "${industrySlug}"`);
      console.log(`[useOKRTemplates] 📊 Retry count: ${loadingState.retryCount + 1}`);

      // Try cascading query strategies
      let masterData: any[] | null = null;
      let queryMethod: TemplateDebugInfo['queryMethod'] = 'exact_match';
      let fallbackAttempted = false;

      // Strategy 1: Exact industry slug match
      if (industrySlug) {
        console.log(`[useOKRTemplates] 🎯 Strategy 1: Exact match for industry "${industrySlug}"`);
        
        const exactQuery = supabase
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
          .eq('is_active', true)
          .eq('industry', industrySlug)
          .order('priority_level', { ascending: true })
          .order('category', { ascending: true });

        const { data: exactData, error: exactError } = await exactQuery;
        
        if (exactError) {
          console.error('[useOKRTemplates] ❌ Exact match query failed:', exactError);
          errorLogger.logDatabaseError(
            'SELECT * FROM okr_master WHERE industry = ? AND is_active = true',
            new Error(exactError.message),
            {
              table: 'okr_master',
              filters: { industry: industrySlug, is_active: true },
              queryMethod: 'exact_match'
            }
          );
        } else {
          console.log(`[useOKRTemplates] ✅ Exact match found ${exactData?.length || 0} templates`);
          masterData = exactData;
        }

        // Strategy 2: Partial match fallback if exact match returns no results
        if (!exactError && (!exactData || exactData.length === 0)) {
          console.log(`[useOKRTemplates] 🔄 Strategy 2: Partial match for industry containing "${industrySlug}"`);
          fallbackAttempted = true;
          queryMethod = 'contains_match';
          
          const partialQuery = supabase
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
            .eq('is_active', true)
            .ilike('industry', `%${industrySlug}%`)
            .order('priority_level', { ascending: true })
            .order('category', { ascending: true });

          const { data: partialData, error: partialError } = await partialQuery;
          
          if (partialError) {
            console.error('[useOKRTemplates] ❌ Partial match query failed:', partialError);
            errorLogger.logDatabaseError(
              'SELECT * FROM okr_master WHERE industry ILIKE ? AND is_active = true',
              new Error(partialError.message),
              {
                table: 'okr_master',
                filters: { industry: `%${industrySlug}%`, is_active: true },
                queryMethod: 'partial_match'
              }
            );
          } else {
            console.log(`[useOKRTemplates] ✅ Partial match found ${partialData?.length || 0} templates`);
            masterData = partialData;
          }
        }
      }

      // Strategy 3: Load all templates as final fallback
      if (!masterData || masterData.length === 0) {
        console.log(`[useOKRTemplates] 🔄 Strategy 3: Loading all active templates as fallback`);
        fallbackAttempted = true;
        queryMethod = 'all_templates';
        
        const allQuery = supabase
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
          .eq('is_active', true)
          .order('priority_level', { ascending: true })
          .order('category', { ascending: true });

        const { data: allData, error: allError } = await allQuery;
        
        if (allError) {
          console.error('[useOKRTemplates] ❌ All templates query failed:', allError);
          errorLogger.logDatabaseError(
            'SELECT * FROM okr_master WHERE is_active = true',
            new Error(allError.message),
            {
              table: 'okr_master',
              filters: { is_active: true },
              queryMethod: 'all_templates'
            }
          );
          throw new Error(allError.message);
        } else {
          console.log(`[useOKRTemplates] ✅ All templates fallback found ${allData?.length || 0} templates`);
          masterData = allData;
        }
      }

      if (!masterData || masterData.length === 0) {
        console.log('[useOKRTemplates] ⚠️ No templates found with any strategy');
        const debugData: TemplateDebugInfo = {
          industrySlug,
          queryParams: {
            table: 'okr_master',
            filter: industrySlug ? 'industry' : 'all',
            value: industrySlug || null
          },
          results: {
            totalFound: 0,
            templates: []
          },
          timestamp: new Date().toISOString(),
          executionTime: performance.now() - startTime,
          queryMethod
        };
        
        setDebugInfo(debugData);
        setLoadingState(prev => ({
          ...prev,
          debugInfo: debugData,
          fallbackAttempted
        }));
        setTemplates([]);
        return;
      }

      // Get metric types for each template from okr_master_metrics
      console.log(`[useOKRTemplates] 📊 Loading metrics for ${masterData.length} templates`);
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
        console.warn('[useOKRTemplates] ⚠️ Failed to load metric types:', metricsError.message);
        errorLogger.logDatabaseError(
          'SELECT * FROM okr_master_metrics WHERE okr_master_id IN (?)',
          new Error(metricsError.message),
          {
            table: 'okr_master_metrics',
            filters: { okr_master_id: masterIds },
            queryMethod: 'metrics_fetch',
            templateCount: masterData.length
          }
        );
        // Continue without metric types - they can be selected later
      } else {
        console.log(`[useOKRTemplates] ✅ Loaded metrics for ${metricsData?.length || 0} template-metric relationships`);
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

      const executionTime = performance.now() - startTime;
      
      // Create comprehensive debug info
      const debugData: TemplateDebugInfo = {
        industrySlug,
        queryParams: {
          table: 'okr_master',
          filter: industrySlug ? 'industry' : 'all',
          value: industrySlug || null
        },
        results: {
          totalFound: templatesWithMetrics.length,
          templates: templatesWithMetrics
        },
        timestamp: new Date().toISOString(),
        executionTime,
        queryMethod
      };

      console.log(`[useOKRTemplates] ✅ Successfully transformed ${templatesWithMetrics.length} templates in ${executionTime.toFixed(2)}ms`);
      console.log(`[useOKRTemplates] 📋 Template categories found:`, [...new Set(templatesWithMetrics.map(t => t.category))]);
      console.log(`[useOKRTemplates] 🏭 Industries represented:`, [...new Set(masterData.map(m => m.industry))]);
      
      if (fallbackAttempted) {
        console.log(`[useOKRTemplates] ⚠️ Used fallback strategy: ${queryMethod}`);
      }

      // Complete performance tracking
      performanceMonitor.completeTemplateLoading(performanceId, true, undefined, {
        templateCount: templatesWithMetrics.length,
        queryMethod,
        fallbackUsed: fallbackAttempted,
        executionTime,
        categoriesFound: [...new Set(templatesWithMetrics.map(t => t.category))].length,
        industriesRepresented: [...new Set(masterData.map(m => m.industry))].length
      });

      setDebugInfo(debugData);
      setLoadingState(prev => ({
        ...prev,
        debugInfo: debugData,
        fallbackAttempted
      }));
      setTemplates(templatesWithMetrics);
    } catch (err) {
      const executionTime = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch OKR templates';
      
      console.error('[useOKRTemplates] ❌ Critical error:', err);
      console.error('[useOKRTemplates] 📊 Error occurred after', executionTime.toFixed(2), 'ms');
      console.error('[useOKRTemplates] 🔍 Context:', {
        industrySlug,
        retryCount: loadingState.retryCount + 1,
        timestamp: new Date().toISOString()
      });

      // Log the error with full context
      errorLogger.logTemplateError(
        `Template loading failed: ${errorMessage}`,
        err instanceof Error ? err : new Error(errorMessage),
        {
          industrySlug,
          retryCount: loadingState.retryCount + 1,
          executionTime,
          fallbackAttempted: false,
          queryMethod: 'unknown'
        }
      );

      const errorDebugInfo: TemplateDebugInfo = {
        industrySlug,
        queryParams: {
          table: 'okr_master',
          filter: industrySlug ? 'industry' : 'all',
          value: industrySlug || null
        },
        results: {
          totalFound: 0,
          templates: []
        },
        timestamp: new Date().toISOString(),
        executionTime,
        queryMethod: 'fallback'
      };

      // Complete performance tracking with error
      performanceMonitor.completeTemplateLoading(performanceId, false, errorMessage, {
        executionTime,
        retryCount: loadingState.retryCount + 1
      });

      setError(err instanceof Error ? err : new Error(errorMessage));
      setDebugInfo(errorDebugInfo);
      setLoadingState(prev => ({
        ...prev,
        hasError: true,
        errorMessage,
        debugInfo: errorDebugInfo
      }));
    } finally {
      setIsLoading(false);
      setLoadingState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [supabase, industrySlug, loadingState.retryCount]);

  const refetch = useCallback(async (resetRetryCount = false) => {
    if (resetRetryCount) {
      setLoadingState(prev => ({ ...prev, retryCount: 0 }));
    }
    await fetchTemplates();
  }, [fetchTemplates]);

  const retryWithBackoff = useCallback(async () => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    if (loadingState.retryCount >= maxRetries) {
      console.warn('[useOKRTemplates] ⚠️ Max retries reached, not attempting retry');
      return;
    }

    const delay = baseDelay * Math.pow(2, loadingState.retryCount); // Exponential backoff
    console.log(`[useOKRTemplates] 🔄 Retrying in ${delay}ms (attempt ${loadingState.retryCount + 1}/${maxRetries})`);
    
    setTimeout(() => {
      refetch();
    }, delay);
  }, [loadingState.retryCount, refetch]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    refetch,
    retryWithBackoff,
    debugInfo: process.env.NODE_ENV === 'development' ? debugInfo : undefined,
    loadingState: process.env.NODE_ENV === 'development' ? loadingState : undefined,
  };
}