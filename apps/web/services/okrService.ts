import { createClient } from '@boastitup/supabase/client';

const BRAND_ID = '4743e593-3f09-4eba-96b4-c4c1413bca47'; // Default brand ID

export const OKRService = {
  // 1. Get all OKRs for a brand with current performance
  fetchCurrentPerformanceOKRs: async (brandId: string = BRAND_ID) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_okr_current_performance')
      .select('*')
      .eq('brand_id', brandId)
      .order('is_primary', { ascending: false })
      .order('okr_category');
    
    if (error) throw error;
    
    // Smart deduplication - use objective_name as key since you have duplicate OKR IDs
    if (data) {
      const okrMap = new Map();
      
      data.forEach(record => {
        const key = record.objective_name; // Use objective name instead of ID
        const existing = okrMap.get(key);
        
        if (!existing) {
          // First record for this objective
          okrMap.set(key, record);
        } else {
          // Prefer primary metrics first
          if (record.is_primary && !existing.is_primary) {
            okrMap.set(key, record);
          } 
          // If both are primary or both are not, prefer higher weighted metrics
          else if (record.is_primary === existing.is_primary) {
            if (record.metric_weight > existing.metric_weight) {
              okrMap.set(key, record);
            }
            // If weights are equal, prefer more recent data
            else if (record.metric_weight === existing.metric_weight && 
                     new Date(record.last_updated_date) > new Date(existing.last_updated_date)) {
              okrMap.set(key, record);
            }
          }
        }
      });
      
      const uniqueOKRs = Array.from(okrMap.values());
      console.log(`🔧 Smart Deduplicated OKRs: ${data.length} -> ${uniqueOKRs.length}`);
      console.log(`📊 Deduplication details:`, {
        originalCount: data.length,
        uniqueCount: uniqueOKRs.length,
        primaryMetrics: uniqueOKRs.filter(okr => okr.is_primary).length,
        uniqueObjectives: [...new Set(data.map(d => d.objective_name))].length,
        duplicateOKRIds: data.length > uniqueOKRs.length ? 'Yes - using objective_name for dedup' : 'No'
      });
      
      return uniqueOKRs;
    }
    
    return data;
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
      .from('v_okr_current_performance')
      .select('objective_name, metric_name, current_value, metric_target_value, progress_percentage, performance_status, platform_name, okr_id, is_primary, metric_weight, last_updated_date')
      .eq('brand_id', brandId)
      .in('performance_status', ['Behind', 'At Risk'])
      .eq('is_primary', true)
      .order('progress_percentage', { ascending: true });
    
    if (error) throw error;
    
    // Apply same deduplication logic for attention metrics
    if (data) {
      const okrMap = new Map();
      
      data.forEach(record => {
        const key = record.objective_name;
        const existing = okrMap.get(key);
        
        if (!existing) {
          okrMap.set(key, record);
        } else {
          // Prefer primary metrics, higher weight, more recent data
          if (record.is_primary && !existing.is_primary) {
            okrMap.set(key, record);
          } else if (record.is_primary === existing.is_primary) {
            if (record.metric_weight > existing.metric_weight) {
              okrMap.set(key, record);
            } else if (record.metric_weight === existing.metric_weight && 
                       new Date(record.last_updated_date) > new Date(existing.last_updated_date)) {
              okrMap.set(key, record);
            }
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
};