import { createClient } from '@boastitup/supabase/client';
import { actionUpdateSchema, brandHealthScoreSchema } from '../lib/brand-health-validation';
import type { 
  BrandHealthScore, 
  InsightWithActions, 
  RecommendedActionV1, 
  ActionStage,
  CategoryInsights,
  InsightData,
  AIInsight
} from '../types/brand-health';

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
      .single();

    if (error) {
      console.error('Error fetching brand health score:', error);
      throw error;
    }

    return data || null;
  },

  /**
   * Fetch insights with actions - NEW PRIMARY METHOD
   * Uses ai_insights_v1 + ai_recommended_actions_v1 tables
   */
  fetchInsightsWithActions: async (brandId: string, tenantId: string): Promise<InsightWithActions[]> => {
    const { data, error } = await supabase
      .from('ai_insights_v1')
      .select(`
        *,
        ai_recommended_actions_v1(*)
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true, nullsLast: true })
      .order('impact_score', { ascending: false });

    if (error) {
      console.error('Error fetching insights with actions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Groups insights by category for dashboard rendering
   */
  groupInsightsByCategory: (insights: InsightWithActions[]): Record<string, InsightWithActions[]> => {
    return insights.reduce((acc, insight) => {
      const category = insight.insight_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(insight);
      return acc;
    }, {} as Record<string, InsightWithActions[]>);
  },

  /**
   * Gets category statistics for dashboard
   */
  getCategoryInsights: (insights: InsightWithActions[]): CategoryInsights[] => {
    const grouped = BrandHealthService.groupInsightsByCategory(insights);
    
    return Object.entries(grouped).map(([category, categoryInsights]) => {
      const allActions = categoryInsights.flatMap(insight => insight.ai_recommended_actions_v1);
      
      return {
        category,
        insights: categoryInsights,
        totalActions: allActions.length,
        newActions: allActions.filter(action => action.stage === 'new').length,
        urgentActions: allActions.filter(action => 
          action.action_impact_score && action.action_impact_score >= 8
        ).length,
      };
    });
  },

  /**
   * Update action stage - NEW METHOD for action lifecycle management
   */
  updateActionStage: async (
    actionId: string, 
    stage: ActionStage, 
    userId: string
  ): Promise<RecommendedActionV1> => {
    // Validate input
    const validatedInput = actionUpdateSchema.parse({ actionId, stage, userId });
    
    const updates: any = { stage };
    
    // Add timestamp based on stage
    const now = new Date().toISOString();
    if (stage === 'viewed') {
      updates.viewed_at = now;
      updates.viewed_by = userId;
    } else if (stage === 'saved') {
      updates.saved_at = now;
      updates.saved_by = userId;
    } else if (stage === 'actioned') {
      updates.actioned_at = now;
      updates.actioned_by = userId;
    }
    
    const { data, error } = await supabase
      .from('ai_recommended_actions_v1')
      .update(updates)
      .eq('id', actionId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating action stage:', error);
      throw error;
    }
    
    return data;
  },

  /**
   * Link action to OKR objective
   */
  linkActionToOKR: async (actionId: string, okrObjectiveId: string): Promise<RecommendedActionV1> => {
    const { data, error } = await supabase
      .from('ai_recommended_actions_v1')
      .update({ okr_objective_id: okrObjectiveId })
      .eq('id', actionId)
      .select()
      .single();
      
    if (error) {
      console.error('Error linking action to OKR:', error);
      throw error;
    }
    
    return data;
  },

  /**
   * Assign action to campaign
   */
  assignActionToCampaign: async (actionId: string, campaignId: string): Promise<RecommendedActionV1> => {
    const { data, error } = await supabase
      .from('ai_recommended_actions_v1')
      .update({ assigned_to_campaign_id: campaignId })
      .eq('id', actionId)
      .select()
      .single();
      
    if (error) {
      console.error('Error assigning action to campaign:', error);
      throw error;
    }
    
    return data;
  },

  /**
   * Get actions by stage for filtering
   */
  getActionsByStage: (insights: InsightWithActions[], stages: ActionStage[]): RecommendedActionV1[] => {
    return insights
      .flatMap(insight => insight.ai_recommended_actions_v1)
      .filter(action => stages.includes(action.stage));
  },

  /**
   * Get urgent actions requiring immediate attention
   */
  getUrgentActions: (insights: InsightWithActions[]): RecommendedActionV1[] => {
    return insights
      .flatMap(insight => insight.ai_recommended_actions_v1)
      .filter(action => 
        action.action_impact_score && 
        action.action_impact_score >= 8 && 
        ['new', 'viewed'].includes(action.stage)
      )
      .sort((a, b) => (b.action_impact_score || 0) - (a.action_impact_score || 0));
  },

  // LEGACY METHODS - for backward compatibility
  /**
   * Fetches all insights grouped by category for a specific brand
   * @deprecated Use fetchInsightsWithActions instead
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
   * @deprecated Use fetchInsightsWithActions instead
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
   * Calculates summary statistics for insights
   * @deprecated Use getCategoryInsights instead
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
   * @deprecated Use getCategoryInsights instead
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