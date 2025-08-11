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
      .select('objective_name, metric_name, current_value, metric_target_value, progress_percentage, performance_status, platform_name')
      .eq('brand_id', brandId)
      .in('performance_status', ['Behind', 'At Risk'])
      .eq('is_primary', true)
      .order('progress_percentage', { ascending: true });
    
    if (error) throw error;
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