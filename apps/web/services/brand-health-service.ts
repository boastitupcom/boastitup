import { createClient } from '@boastitup/supabase/client';
import type { BrandHealthScore, InsightData, AIInsight } from '../types/brand-health';

const supabase = createClient();

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
      .order('calculation_date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching brand health score:', error);
      throw error;
    }

    return data?.[0] || null;
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
   * Groups insights by category for easier rendering
   */
  groupInsightsByCategory: (insights: InsightData[]) => {
    return insights.reduce((acc, insight) => {
      const category = insight.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(insight);
      return acc;
    }, {} as Record<string, InsightData[]>);
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