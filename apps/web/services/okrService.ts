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
};