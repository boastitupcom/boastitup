import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

export interface CampaignInsightsByCompetitor {
  campaign_type_enum: string;
  brand_id: string;
  product_id?: string;
  competitor_id: string;
  competitor_avg_engagement: number;
  competitor_avg_spend: number;
  avg_engagement_rate: number;
  total_marketing_spend: number;
  total_attributed_revenue: number;
  roi: number;
}

export interface AIRecommendedAction {
  id: string;
  insight_id: string;
  suggested_action_text: string;
  action_priority: string;
  action_description?: string;
  stage: string;
  action_confidence_score?: number;
  action_impact_score?: number;
  suggested_hashtags?: string;
  suggested_action_type?: string;
  suggested_target_audience?: string[];
  suggested_engagement_objective?: string;
  suggested_campaign_type?: string;
  suggested_budget?: number;
  suggested_platforms?: string[];
  suggested_budget_currency_symbol?: string;
  created_at: string;
}

export const useCampaignInsightsByCompetitor = (
  brandId: string,
  campaignType?: string,
  productId?: string
) => {
  return useQuery({
    queryKey: ['campaign-insights-by-competitor', brandId, campaignType, productId],
    queryFn: async (): Promise<CampaignInsightsByCompetitor[]> => {
      if (!brandId) return [];

      try {
        let query = supabase
          .from('campaign_insights_by_competitor')
          .select('*')
          .eq('brand_id', brandId);

        if (campaignType) {
          query = query.eq('campaign_type_enum', campaignType);
        }

        if (productId) {
          query = query.eq('product_id', productId);
        }

        const { data, error } = await query.order('roi', { ascending: false });

        if (error) {
          console.error('Error fetching campaign insights by competitor:', error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error('Network error fetching campaign insights:', err);
        return [];
      }
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useAIRecommendedActions = (brandId: string, campaignType?: string) => {
  return useQuery({
    queryKey: ['ai-recommended-actions', brandId, campaignType],
    queryFn: async (): Promise<AIRecommendedAction[]> => {
      if (!brandId) return [];

      let query = supabase
        .from('ai_recommended_actions_v1')
        .select('*')
        .eq('stage', 'new')
        .order('action_priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (campaignType) {
        query = query.eq('suggested_campaign_type', campaignType);
      }

      const { data, error } = await query.limit(3);

      if (error) {
        console.error('Error fetching AI recommended actions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!brandId,
    staleTime: 2 * 60 * 1000, // 2 minutes for more real-time AI recommendations
  });
};