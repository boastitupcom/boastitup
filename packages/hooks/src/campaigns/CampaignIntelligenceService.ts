import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

export interface CampaignIntelligence {
  competitorData: {
    activeCampaigns: number;
    avgSpend: number;
    topContentType: string;
    avgEngagement: number;
    roi: number;
    totalRevenue: number;
  };
  recommendations: AIRecommendation[];
  recentCampaigns: CampaignSummary[];
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface CampaignSummary {
  id: string;
  campaign_name: string;
  campaign_type: string;
  created_at: string;
}

export interface BrandProduct {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CampaignIntelligenceService = {
  // Get comprehensive intelligence data for campaign setup
  getIntelligence: async (brandId: string, campaignTypeId?: string, productId?: string): Promise<CampaignIntelligence> => {
    const [competitorInsights, aiRecommendations, recentCampaigns] = await Promise.all([
      CampaignIntelligenceService.getCompetitorInsights(brandId, campaignTypeId, productId),
      CampaignIntelligenceService.getAIRecommendations(brandId),
      CampaignIntelligenceService.getRecentCampaigns(brandId, productId)
    ]);

    return {
      competitorData: competitorInsights,
      recommendations: aiRecommendations,
      recentCampaigns: recentCampaigns
    };
  },

  // Fetch competitor insights using brand_id and product_id from the view
  getCompetitorInsights: async (brandId: string, campaignTypeId?: string, productId?: string) => {
    let query = supabase
      .from('campaign_insights_by_competitor')
      .select(`
        competitor_avg_engagement,
        competitor_avg_spend,
        avg_engagement_rate,
        total_marketing_spend,
        total_attributed_revenue,
        roi,
        campaign_type,
        product_id
      `)
      .eq('brand_id', brandId);

    // Filter by campaign type if provided
    if (campaignTypeId) {
      query = query.eq('campaign_type', campaignTypeId);
    }

    // Filter by product if provided
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching competitor insights:', error);
      throw error;
    }

    // Aggregate the results to provide summary statistics
    const aggregatedData = CampaignIntelligenceService.aggregateCompetitorData(data || []);
    return aggregatedData;
  },

  // Aggregate competitor data for display
  aggregateCompetitorData: (rawData: any[]) => {
    if (!rawData || rawData.length === 0) {
      return {
        activeCampaigns: 0,
        avgSpend: 0,
        topContentType: 'No data available',
        avgEngagement: 0,
        roi: 0,
        totalRevenue: 0
      };
    }

    const totalCampaigns = rawData.length;
    const avgSpend = rawData.reduce((sum, item) => sum + (item.competitor_avg_spend || 0), 0) / totalCampaigns;
    const avgEngagement = rawData.reduce((sum, item) => sum + (item.competitor_avg_engagement || 0), 0) / totalCampaigns;
    const avgROI = rawData.reduce((sum, item) => sum + (item.roi || 0), 0) / totalCampaigns;
    const totalRevenue = rawData.reduce((sum, item) => sum + (item.total_attributed_revenue || 0), 0);

    return {
      activeCampaigns: totalCampaigns,
      avgSpend: Math.round(avgSpend),
      topContentType: 'Product Demos', // Could be enhanced with actual content type analysis
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      roi: parseFloat(avgROI.toFixed(2)),
      totalRevenue: Math.round(totalRevenue)
    };
  },

  // Get AI recommendations for campaign setup
  getAIRecommendations: async (brandId: string): Promise<AIRecommendation[]> => {
    const { data, error } = await supabase
      .from('ai_recommended_actions_v1')
      .select(`
        id,
        suggested_action_text,
        action_description,
        action_priority,
        action_confidence_score,
        action_impact_score
      `)
      .eq('insight_id', brandId)
      .eq('stage', 'new')
      .order('action_impact_score', { ascending: false })
      .limit(3);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      title: item.suggested_action_text || 'AI Recommendation',
      description: item.action_description || '',
      confidence: item.action_confidence_score || 0,
      impact: item.action_impact_score > 0.7 ? 'High' : item.action_impact_score > 0.4 ? 'Medium' : 'Low',
      category: 'Campaign Optimization'
    }));
  },

  // Get recent campaign names for inspiration
  getRecentCampaigns: async (brandId: string, productId?: string): Promise<CampaignSummary[]> => {
    let query = supabase
      .from('campaigns')
      .select('id, campaign_name, campaign_type, created_at')
      .eq('brand_id', brandId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  },

  // Get brand products
  getBrandProducts: async (brandId: string): Promise<BrandProduct[]> => {
    const { data, error } = await supabase
      .from('brand_products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};