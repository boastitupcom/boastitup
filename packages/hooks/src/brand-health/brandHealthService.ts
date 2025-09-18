import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

export interface BrandHealthScore {
  id?: string;
  tenant_id: string;
  brand_id: string;
  date_id: string;
  brand_health_score?: number;
  overall_score?: number;
  sentiment_score?: number;
  normalized_engagement_rate_score?: number;
  normalized_reach_score?: number;
  normalized_mentions_velocity_score?: number;
  normalized_engagement_volume_score?: number;
  engagement_rate_score?: number;
  reach_score?: number;
  mentions_velocity_score?: number;
  engagement_volume_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AIInsight {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id: string;
  okr_objective_id?: string;
  name?: string;
  date?: string;
  insight_type?: string;
  insight_category: string;
  insight_title: string;
  insight_description: string;
  platform?: string;
  confidence_score?: number;
  impact_score?: number;
  priority_display?: string;
  confidence_display?: string;
  trend_indicator?: string;
  recommended_actions?: any;
  data_points?: any;
  action_count?: number;
  top_action?: string;
  stage?: string;
  stage_display?: string;
  viewed_at?: string;
  viewed_by?: string;
  viewed_by_email?: string;
  saved_at?: string;
  saved_by?: string;
  saved_by_email?: string;
  actioned_at?: string;
  actioned_by?: string;
  actioned_by_email?: string;
  created_at?: string;
  expires_at?: string;
  days_old?: number;
  age_group?: string;
  expiry_status?: string;
  days_until_expiry?: number;
  composite_score?: number;
  action_status?: string;
  is_active?: boolean;
  requires_immediate_action?: boolean;
}

export interface InsightData {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id: string;
  category: string;
  insight_type: string;
  insight_title: string;
  insight_description: string;
  insight_status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const BrandHealthService = {
  /**
   * Fetches the latest brand health score for a given brand and tenant
   */
  fetchBrandHealthScore: async (brandId: string, tenantId: string): Promise<BrandHealthScore | null> => {
    const { data, error } = await supabase
      .from('v_brand_health_scores')
      .select('*')
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .order('date_id', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching brand health score:', error);
      throw error;
    }

    if (!data) return null;

    // Normalize the score to 0-100 range for UI display
    // The raw score from the view is much higher, so we normalize it
    const normalizedScore = Math.min(100, Math.max(0, (data.brand_health_score || 0) / 100));

    return {
      ...data,
      brand_health_score: normalizedScore,
      overall_score: normalizedScore,
      // Keep original scores for component calculations
      sentiment_score: data.sentiment_score || 0,
      normalized_engagement_rate_score: data.normalized_engagement_rate_score || 0,
      normalized_reach_score: data.normalized_reach_score || 0,
      normalized_mentions_velocity_score: data.normalized_mentions_velocity_score || 0,
      normalized_engagement_volume_score: data.normalized_engagement_volume_score || 0,
      // Also include computed scores for backward compatibility
      engagement_rate_score: (data.normalized_engagement_rate_score || 0),
      reach_score: Math.min(100, (data.normalized_reach_score || 0) / 10),
      mentions_velocity_score: data.normalized_mentions_velocity_score || 0,
      engagement_volume_score: Math.min(100, (data.normalized_engagement_volume_score || 0) / 10),
    };
  },

  /**
   * Fetches AI-powered insights and recommendations
   */
  fetchAIInsights: async (brandId: string, tenantId: string): Promise<AIInsight[]> => {
    const { data, error } = await supabase
      .from('v_ai_insights_enriched')
      .select(`
        id,
        tenant_id,
        brand_id,
        date_id,
        okr_objective_id,
        name,
        date,
        insight_type,
        insight_category,
        insight_title,
        insight_description,
        platform,
        confidence_score,
        impact_score,
        priority_display,
        confidence_display,
        trend_indicator,
        recommended_actions,
        data_points,
        action_count,
        top_action,
        stage,
        stage_display,
        viewed_at,
        viewed_by,
        viewed_by_email,
        saved_at,
        saved_by,
        saved_by_email,
        actioned_at,
        actioned_by,
        actioned_by_email,
        created_at,
        expires_at,
        days_old,
        age_group,
        expiry_status,
        days_until_expiry,
        composite_score,
        action_status,
        is_active,
        requires_immediate_action
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('composite_score', { ascending: false });

    if (error) {
      console.error('Error fetching AI insights:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches high priority AI insights that require immediate attention
   */
  fetchUrgentAIInsights: async (brandId: string, tenantId: string): Promise<AIInsight[]> => {
    const { data, error } = await supabase
      .from('v_ai_insights_enriched')
      .select(`
        id,
        tenant_id,
        brand_id,
        date_id,
        okr_objective_id,
        name,
        date,
        insight_type,
        insight_category,
        insight_title,
        insight_description,
        platform,
        confidence_score,
        impact_score,
        priority_display,
        confidence_display,
        trend_indicator,
        recommended_actions,
        data_points,
        action_count,
        top_action,
        stage,
        stage_display,
        viewed_at,
        viewed_by,
        viewed_by_email,
        saved_at,
        saved_by,
        saved_by_email,
        actioned_at,
        actioned_by,
        actioned_by_email,
        created_at,
        expires_at,
        days_old,
        age_group,
        expiry_status,
        days_until_expiry,
        composite_score,
        action_status,
        is_active,
        requires_immediate_action
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('requires_immediate_action', true)
      .eq('is_active', true)
      .order('composite_score', { ascending: false });

    if (error) {
      console.error('Error fetching urgent AI insights:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches AI insights filtered by priority
   */
  fetchAIInsightsByPriority: async (
    brandId: string,
    tenantId: string,
    priorities: string[]
  ): Promise<AIInsight[]> => {
    const { data, error } = await supabase
      .from('v_ai_insights_enriched')
      .select(`
        id,
        tenant_id,
        brand_id,
        date_id,
        okr_objective_id,
        name,
        date,
        insight_type,
        insight_category,
        insight_title,
        insight_description,
        platform,
        confidence_score,
        impact_score,
        priority_display,
        confidence_display,
        trend_indicator,
        recommended_actions,
        data_points,
        action_count,
        top_action,
        stage,
        stage_display,
        viewed_at,
        viewed_by,
        viewed_by_email,
        saved_at,
        saved_by,
        saved_by_email,
        actioned_at,
        actioned_by,
        actioned_by_email,
        created_at,
        expires_at,
        days_old,
        age_group,
        expiry_status,
        days_until_expiry,
        composite_score,
        action_status,
        is_active,
        requires_immediate_action
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .in('priority_display', priorities)
      .eq('is_active', true)
      .order('composite_score', { ascending: false });

    if (error) {
      console.error('Error fetching AI insights by priority:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches AI insights filtered by action status
   */
  fetchAIInsightsByStatus: async (
    brandId: string,
    tenantId: string,
    statuses: string[]
  ): Promise<AIInsight[]> => {
    const { data, error } = await supabase
      .from('v_ai_insights_enriched')
      .select(`
        id,
        tenant_id,
        brand_id,
        date_id,
        okr_objective_id,
        name,
        date,
        insight_type,
        insight_category,
        insight_title,
        insight_description,
        platform,
        confidence_score,
        impact_score,
        priority_display,
        confidence_display,
        trend_indicator,
        recommended_actions,
        data_points,
        action_count,
        top_action,
        stage,
        stage_display,
        viewed_at,
        viewed_by,
        viewed_by_email,
        saved_at,
        saved_by,
        saved_by_email,
        actioned_at,
        actioned_by,
        actioned_by_email,
        created_at,
        expires_at,
        days_old,
        age_group,
        expiry_status,
        days_until_expiry,
        composite_score,
        action_status,
        is_active,
        requires_immediate_action
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .in('action_status', statuses)
      .eq('is_active', true)
      .order('composite_score', { ascending: false });

    if (error) {
      console.error('Error fetching AI insights by status:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches all insights grouped by category for a specific brand
   */
  fetchInsightsByCategory: async (brandId: string, tenantId: string): Promise<InsightData[]> => {
    const { data, error } = await supabase
      .from('v_generated_insights')
      .select('*')
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .order('category')
      .order('display_order');

    if (error) {
      console.error('Error fetching insights by category:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches insights for a specific category
   */
  fetchInsightsBySpecificCategory: async (
    brandId: string,
    tenantId: string,
    category: string
  ): Promise<InsightData[]> => {
    const { data, error } = await supabase
      .from('v_generated_insights')
      .select('*')
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('category', category)
      .order('display_order');

    if (error) {
      console.error(`Error fetching insights for category ${category}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Calculates summary statistics for insights
   */
  calculateInsightsSummary: (insights: InsightData[]) => {
    const total = insights.length;
    const good = insights.filter(i => i.insight_status === 'Good').length;
    const needsAttention = insights.filter(i => i.insight_status === 'Needs Attention').length;
    const critical = insights.filter(i => i.insight_status === 'Critical').length;

    return {
      total,
      good,
      needsAttention,
      critical,
      goodPercentage: total > 0 ? Math.round((good / total) * 100) : 0,
      needsAttentionPercentage: total > 0 ? Math.round((needsAttention / total) * 100) : 0,
      criticalPercentage: total > 0 ? Math.round((critical / total) * 100) : 0,
    };
  },

  /**
   * Calculates summary statistics for AI insights
   */
  calculateAIInsightsSummary: (insights: AIInsight[]) => {
    const total = insights.length;
    const urgent = insights.filter(i => i.requires_immediate_action).length;
    const highPriority = insights.filter(i => i.priority_display === 'HIGH PRIORITY' || i.priority_display === 'CRITICAL PRIORITY').length;
    const completed = insights.filter(i => i.action_status === 'Completed').length;
    const inProgress = insights.filter(i => i.action_status === 'In Progress' || i.action_status === 'Selected for Action').length;

    return {
      total,
      urgent,
      highPriority,
      completed,
      inProgress,
      pending: total - completed - inProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
};