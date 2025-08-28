import { createClient } from '@boastitup/supabase/client';

const BRAND_ID = '4743e593-3f09-4eba-96b4-c4c1413bca47'; // Default brand ID

// Helper function to determine status priority for deduplication
function getStatusPriority(status: string): number {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'target achieved': return 4;
    case 'on track': return 3;
    case 'behind': return 2;
    case 'at risk': return 1;
    case 'not started': return 0;
    default: return 0;
  }
}

export const OKRService = {
  // 1. Get OKR performance data with optional filtering (NEW)
  fetchOKRPerformance: async (params?: { 
    brandId?: string;
    okrId?: string; 
    title?: string;
  }) => {
    const supabase = createClient();
    const { brandId = BRAND_ID, okrId, title } = params || {};
    
    let query = supabase
      .from('v_okr_performance')
      .select('title, current_value, target_value, progress_percentage, status, platform_name, metric_unit, health, id, brand_id')
      .eq('brand_id', brandId);

    // Apply filters based on parameters
    if (okrId) {
      query = query.eq('id', okrId);
    } else if (title) {
      query = query.ilike('title', `%${title}%`); // case-insensitive partial match
    }

    // Order by status first, then progress_percentage
    query = query
      .order('status', { ascending: true })
      .order('progress_percentage', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Smart deduplication - use title as key
    if (data) {
      const okrMap = new Map();
      
      data.forEach(record => {
        const key = record.title; // Use title instead of objective_name
        const existing = okrMap.get(key);
        
        if (!existing) {
          // First record for this title
          okrMap.set(key, record);
        } else {
          // Prefer records with better status or higher progress
          const currentStatusPriority = getStatusPriority(record.status);
          const existingStatusPriority = getStatusPriority(existing.status);
          
          if (currentStatusPriority > existingStatusPriority) {
            okrMap.set(key, record);
          } else if (currentStatusPriority === existingStatusPriority && 
                     record.progress_percentage > existing.progress_percentage) {
            okrMap.set(key, record);
          }
        }
      });
      
      const uniqueOKRs = Array.from(okrMap.values());
      console.log(`🔧 New v_okr_performance - Deduplicated: ${data.length} -> ${uniqueOKRs.length}`);
      
      return uniqueOKRs;
    }
    
    return data;
  },

  // Backward compatibility - use new method
  fetchCurrentPerformanceOKRs: async (brandId: string = BRAND_ID) => {
    return OKRService.fetchOKRPerformance({ brandId });
  },

  // 2. Get OKR progress summary for executive review
  fetchProgressSummary: async (brandId: string = BRAND_ID) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_okr_progress_summary')
      .select('*')
      .eq('brand_id', brandId)
      .order('okr_health_score', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 3. Get brand dashboard overview
  fetchBrandDashboardOverview: async (brandId: string = BRAND_ID) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_brand_okr_dashboard')
      .select('*')
      .eq('brand_id', brandId);
    
    if (error) throw error;
    return data;
  },

  // 4. Get trend analysis for specific OKR
  fetchOKRTrendAnalysis: async (okrId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_okr_trend_analysis')
      .select('*')
      .eq('okr_id', okrId)
      .eq('is_primary', true)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 5. Get all metrics needing attention (behind or at risk)
  fetchAttentionMetrics: async (brandId: string = BRAND_ID) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_okr_performance')
      .select('title, current_value, target_value, progress_percentage, status, platform_name, metric_unit, health, id')
      .eq('brand_id', brandId)
      .in('status', ['Behind', 'At Risk'])
      .order('progress_percentage', { ascending: true });
    
    if (error) throw error;
    
    // Apply same deduplication logic for attention metrics
    if (data) {
      const okrMap = new Map();
      
      data.forEach(record => {
        const key = record.title; // Use title instead of objective_name
        const existing = okrMap.get(key);
        
        if (!existing) {
          okrMap.set(key, record);
        } else {
          // Prefer records with worse status (more urgent) or lower progress
          const currentStatusPriority = getStatusPriority(record.status);
          const existingStatusPriority = getStatusPriority(existing.status);
          
          if (currentStatusPriority < existingStatusPriority) {
            okrMap.set(key, record); // Lower priority = worse status = more urgent
          } else if (currentStatusPriority === existingStatusPriority && 
                     record.progress_percentage < existing.progress_percentage) {
            okrMap.set(key, record); // Lower progress = more urgent
          }
        }
      });
      
      const uniqueAttentionMetrics = Array.from(okrMap.values());
      console.log(`🚨 Attention Metrics Deduplicated: ${data.length} -> ${uniqueAttentionMetrics.length}`);
      
      return uniqueAttentionMetrics;
    }
    
    return data;
  },

  // 6. Fetch AI Insights
  fetchAIInsights: async (brandId: string = BRAND_ID) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('brand_id', brandId);
    
    if (error) throw error;
    return data;
  },

  // 7. Fetch OKR Templates with cascading fallback strategy
  fetchOKRTemplates: async (industrySlug?: string) => {
    const supabase = createClient();
    
    try {
      console.log(`[OKRService.fetchOKRTemplates] Starting cascading query for industry slug: "${industrySlug}"`);
      
      let masterData: any[] | null = null;
      let queryMethod = 'none';

      // Strategy 1: Exact industry slug match (if provided)
      if (industrySlug) {
        console.log(`[OKRService] Attempt 1: Exact match for "${industrySlug}"`);
        const { data: exactData, error: exactError } = await supabase
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

        if (exactError) {
          console.warn(`[OKRService] Exact match query error:`, exactError.message);
        } else if (exactData && exactData.length > 0) {
          masterData = exactData;
          queryMethod = 'exact_match';
          console.log(`[OKRService] ✅ Exact match found: ${exactData.length} templates`);
        } else {
          console.log(`[OKRService] ❌ No exact match for "${industrySlug}"`);
        }
      }

      // Strategy 2: Partial industry name matching using ILIKE (fallback)
      if (!masterData && industrySlug) {
        console.log(`[OKRService] Attempt 2: Partial match for "${industrySlug}"`);
        const { data: partialData, error: partialError } = await supabase
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

        if (partialError) {
          console.warn(`[OKRService] Partial match query error:`, partialError.message);
        } else if (partialData && partialData.length > 0) {
          masterData = partialData;
          queryMethod = 'partial_match';
          console.log(`[OKRService] ✅ Partial match found: ${partialData.length} templates`);
        } else {
          console.log(`[OKRService] ❌ No partial match for "${industrySlug}"`);
        }
      }

      // Strategy 3: Load all active templates (final fallback)
      if (!masterData) {
        console.log(`[OKRService] Attempt 3: Loading all active templates as fallback`);
        const { data: allData, error: allError } = await supabase
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

        if (allError) {
          throw new Error(allError.message);
        } else {
          masterData = allData;
          queryMethod = 'all_templates';
          console.log(`[OKRService] ✅ Fallback successful: ${allData?.length || 0} templates loaded`);
        }
      }

      console.log(`[OKRService] Query method used: ${queryMethod}`);
      console.log(`[OKRService.fetchOKRTemplates] Found ${masterData?.length || 0} master templates`);

      if (!masterData || masterData.length === 0) {
        console.log(`[OKRService.fetchOKRTemplates] No templates found after all fallback strategies`);
        return [];
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
      }

      // Transform to OKRTemplate format
      const templates = masterData.map(master => {
        // Find primary metric type for this template
        const primaryMetric = metricsData?.find(
          m => m.okr_master_id === master.id && m.is_primary
        );
        
        return {
          id: master.id,
          okrMasterId: master.id,
          title: master.objective_title,
          description: master.objective_description || '',
          category: master.category,
          priority: master.priority_level,
          suggestedTargetValue: primaryMetric?.target_improvement_percentage || 10,
          suggestedTimeframe: master.suggested_timeframe as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'quarterly',
          applicablePlatforms: [],
          metricTypeId: primaryMetric?.metric_type_id || '',
          confidenceScore: 0.85,
          reasoning: `Suggested for ${master.industry} industry in ${master.category} category`
        };
      });

      console.log(`[OKRService.fetchOKRTemplates] Successfully transformed ${templates.length} templates`);
      console.log(`[OKRService.fetchOKRTemplates] Returning templates array:`, templates?.slice(0, 2));
      return templates;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch OKR templates');
    }
  },
};