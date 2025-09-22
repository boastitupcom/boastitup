// packages/hooks/src/competitor-intelligence/competitorIntelligenceService.ts
import { createClient } from '@boastitup/supabase/client';
import type { 
  TrendingTopic, 
  CompetitorIntelligence, 
  IntelligenceInsight, 
  ApiResponse,
  AggregatedCompetitorMetrics,
  TrendMomentum,
  CompetitiveAdvantage,
  BrandCurrency
} from '@boastitup/types';

const supabase = createClient();

export const CompetitorIntelligenceService = {
  /**
   * Fetch trending topics for a specific brand
   */
  fetchTrendingTopics: async (brandId: string): Promise<ApiResponse<TrendingTopic[]>> => {
    try {
      // For now, return empty data as the trending topics view may not exist
      // This prevents the error while allowing the rest of the app to function
      const data: TrendingTopic[] = [];
      const error = null;

      // TODO: Implement actual trending topics query when view is available
      // const { data, error } = await supabase
      //   .from('unified_trends') // Use actual table name
      //   .select('*')
      //   .eq('brand_id', brandId)
      //   .limit(10);

      if (error) {
        console.error('Error fetching trending topics:', error);
        return { 
          error: { 
            message: error.message, 
            code: error.code || 'FETCH_ERROR' 
          } 
        };
      }

      return { data: data as TrendingTopic[] };
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      return { 
        error: { 
          message: 'Failed to fetch trending topics', 
          code: 'NETWORK_ERROR' 
        } 
      };
    }
  },

  /**
   * Fetch competitor intelligence for a specific brand
   */
  fetchCompetitorIntelligence: async (brandId: string): Promise<ApiResponse<CompetitorIntelligence[]>> => {
    try {
      if (!brandId) {
        console.log('No brand ID provided, returning empty data');
        return { data: [] };
      }

      // Use the v_competitor_intelligence_dashboard view that exists and has richer data
      const { data, error } = await supabase
        .from('v_competitor_intelligence_dashboard')
        .select(`
          brand_id,
          competitor_id,
          competitor_name,
          competitor_type,
          tenant_id,
          estimated_campaign_budget,
          content_top_format,
          content_themes,
          content_post_frequency,
          top_hashtags,
          timing_best_day,
          timing_best_time,
          avg_engagement_rate,
          top_platform,
          platform_engagement_breakdown,
          engagement_trend,
          last_metric_date,
          data_freshness,
          tracking_since
        `)
        .eq('brand_id', brandId)
        .order('estimated_campaign_budget', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching competitor intelligence:', error);
        return { data: [] };
      }

      // If no data, return empty array
      if (!data || data.length === 0) {
        console.log('No competitor data found for brand:', brandId);
        return { data: [] };
      }

      // Get actual campaign counts for competitors
      const competitorIds = data.map(item => item.competitor_id).filter(Boolean);
      let campaignCounts: Record<string, number> = {};

      if (competitorIds.length > 0) {
        try {
          const { data: campaignData } = await supabase
            .from('campaigns')
            .select('brand_id')
            .in('brand_id', competitorIds)
            .in('campaign_status', ['active', 'running', 'scheduled']);

          campaignCounts = (campaignData || []).reduce((acc, campaign) => {
            acc[campaign.brand_id] = (acc[campaign.brand_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        } catch (campaignError) {
          console.warn('Failed to fetch campaign counts:', campaignError);
        }
      }

      // Transform the view data to match the expected interface
      const transformedData: CompetitorIntelligence[] = data.map((item, index) => ({
        id: item.competitor_id || `competitor-${index}`,
        competitor_name: item.competitor_name || `Competitor ${index + 1}`,
        tenant_id: item.tenant_id || '',
        brand_id: item.brand_id,
        competitor_type: item.competitor_type || 'direct',
        active_campaigns: campaignCounts[item.competitor_id] || 0,
        avg_spend_raw: item.estimated_campaign_budget || 0,
        avg_spend_display: item.estimated_campaign_budget
          ? `$${(item.estimated_campaign_budget / 1000).toFixed(1)}K`
          : '$0',
        top_content: item.content_top_format || 'Mixed content',
        last_benchmark_update: item.last_metric_date || new Date().toISOString(),
        is_active: true,
        competitor_relationship_created_at: item.tracking_since || new Date().toISOString(),
        competitor_relationship_updated_at: item.tracking_since || new Date().toISOString(),
        avg_engagement_rate: item.avg_engagement_rate || 0,
        // Generate insights based on actual view data
        budget_insight: item.estimated_campaign_budget && item.estimated_campaign_budget > 10000
          ? 'High budget competitor - investing heavily in campaigns'
          : item.estimated_campaign_budget > 0
          ? 'Moderate budget range - consistent campaign spending'
          : 'Budget data not available',
        content_insight: item.content_top_format
          ? `Top performing format: ${item.content_top_format}`
          : 'Mixed content strategy',
        hashtags_insight: item.top_hashtags && Array.isArray(item.top_hashtags) && item.top_hashtags.length > 0
          ? item.top_hashtags.slice(0, 3).join(', ')
          : `#competitor${index + 1}`,
        timing_insight: item.timing_best_day && item.timing_best_time
          ? `Best time: ${item.timing_best_day} at ${item.timing_best_time}`
          : 'Variable timing'
      }));

      console.log(`Successfully fetched ${transformedData.length} competitors for brand ${brandId}`);
      return { data: transformedData };
    } catch (error) {
      console.error('Failed to fetch competitor intelligence:', error);
      return { data: [] }; // Always return empty data rather than error to prevent UI crashes
    }
  },

  /**
   * Generate intelligence insights based on trends and competitor data
   */
  generateIntelligenceInsights: async (
    brandId: string,
    campaignType?: string
  ): Promise<ApiResponse<IntelligenceInsight[]>> => {
    try {
      // First, try to get AI recommendations from the database
      let dbInsights: IntelligenceInsight[] = [];

      try {
        // Query ai_recommended_actions_v1 through ai_insights_v1 to get brand-specific recommendations
        const { data: aiRecommendations, error: aiError } = await supabase
          .from('ai_recommended_actions_v1')
          .select(`
            id,
            suggested_action_text,
            action_description,
            action_priority,
            action_confidence_score,
            action_impact_score,
            stage,
            insight_id,
            ai_insights_v1!inner(
              brand_id
            )
          `)
          .eq('ai_insights_v1.brand_id', brandId)
          .eq('stage', 'new')
          .order('action_impact_score', { ascending: false })
          .limit(3);

        if (!aiError && aiRecommendations && aiRecommendations.length > 0) {
          dbInsights = aiRecommendations.map(item => ({
            id: item.id,
            type: 'ai_recommendation',
            title: item.suggested_action_text || 'AI Recommendation',
            description: item.action_description || '',
            confidence: (item.action_confidence_score || 0) / 100, // Convert to 0-1 scale if needed
            impact: item.action_impact_score > 70 ? 'high' : item.action_impact_score > 40 ? 'medium' : 'low',
            actionable: true,
            suggested_actions: [
              item.suggested_action_text || 'Follow AI recommendation'
            ]
          }));
        }
      } catch (dbError) {
        console.warn('Failed to fetch AI recommendations from database, falling back to generated insights:', dbError);
      }

      // If we have DB insights, return them
      if (dbInsights.length > 0) {
        return { data: dbInsights };
      }

      // Fallback: Generate client-side insights based on trends and competitor data
      const [trendsResponse, competitorsResponse] = await Promise.all([
        CompetitorIntelligenceService.fetchTrendingTopics(brandId),
        CompetitorIntelligenceService.fetchCompetitorIntelligence(brandId)
      ]);

      const trends = trendsResponse.data || [];
      const competitors = competitorsResponse.data || [];
      const insights: IntelligenceInsight[] = [];

      // Generate trend-based insights
      const highGrowthTrends = trends.filter(t => t.growth_percentage > 30);
      if (highGrowthTrends.length > 0) {
        insights.push({
          id: `trend-${Date.now()}`,
          type: 'trend',
          title: 'High Growth Trends Detected',
          description: `${highGrowthTrends.length} trending topics showing 30%+ growth. Consider incorporating ${highGrowthTrends[0].hashtag_display} into your campaign.`,
          confidence: 0.85,
          impact: 'high',
          actionable: true,
          suggested_actions: [
            `Research ${highGrowthTrends[0].hashtag_display} trend details`,
            'Create content aligned with trending topics',
            'Monitor trend sentiment and engagement'
          ]
        });
      }

      // Generate competitor spending insights
      const highSpendCompetitors = competitors.filter(c => c.avg_spend_raw > 5000);
      if (highSpendCompetitors.length > 0) {
        insights.push({
          id: `competitor-${Date.now()}`,
          type: 'competitor',
          title: 'Competitive Spending Analysis',
          description: `${highSpendCompetitors.length} competitors spending $5K+ on campaigns. Market competition is high.`,
          confidence: 0.9,
          impact: 'medium',
          actionable: true,
          suggested_actions: [
            'Analyze competitor campaign strategies',
            'Consider budget optimization',
            'Focus on unique value proposition'
          ]
        });
      }

      return { data: insights };
    } catch (error) {
      console.error('Failed to generate intelligence insights:', error);
      return {
        error: {
          message: 'Failed to generate insights',
          code: 'GENERATION_ERROR'
        }
      };
    }
  },


  /**
   * Get brand currency settings
   */
  getBrandCurrency: async (brandId: string): Promise<ApiResponse<BrandCurrency>> => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('currency_code, currency_symbol')
        .eq('id', brandId)
        .single();

      if (error) {
        console.error('Error fetching brand currency:', error);
        return { 
          error: { 
            message: error.message, 
            code: error.code || 'FETCH_ERROR' 
          } 
        };
      }

      return { data: data as BrandCurrency };
    } catch (error) {
      console.error('Failed to fetch brand currency:', error);
      return { 
        error: { 
          message: 'Failed to fetch brand currency', 
          code: 'NETWORK_ERROR' 
        } 
      };
    }
  }
};

// Helper functions for calculations
export const calculateTrendMomentum = (
  growthPercentage: number, 
  volume: number, 
  velocityScore: number
): TrendMomentum => {
  const momentum = (growthPercentage * 0.4) + (volume / 1000000 * 0.3) + (velocityScore * 100 * 0.3);
  
  if (momentum >= 20) return { level: 'high', score: momentum };
  if (momentum >= 10) return { level: 'medium', score: momentum };
  return { level: 'low', score: momentum };
};

export const formatTrendVolume = (volume: number): string => {
  if (!volume && volume !== 0) {
    throw new Error('Volume data is required for formatting');
  }
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  }
  return volume.toString();
};

export const calculateCompetitiveAdvantage = (
  userSpend: number,
  competitorAverageSpend: number
): CompetitiveAdvantage => {
  const ratio = userSpend / competitorAverageSpend;
  const percentage = Math.abs((ratio - 1) * 100);
  
  if (ratio > 1.2) return { advantage: 'higher', percentage };
  if (ratio < 0.8) return { advantage: 'lower', percentage };
  return { advantage: 'competitive', percentage };
};

export const calculateAggregatedMetrics = (competitors: CompetitorIntelligence[]): AggregatedCompetitorMetrics => {
  if (competitors.length === 0) {
    throw new Error('No competitors available for metrics calculation');
  }

  const totalActiveCampaigns = competitors.reduce((sum, c) => sum + (c.active_campaigns || 0), 0);
  const averageSpend = competitors.reduce((sum, c) => sum + (c.avg_spend_raw || 0), 0) / competitors.length;
  
  // Find most common content type
  const contentTypes = competitors.map(c => c.top_content).filter(Boolean);
  const contentTypeCount = contentTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topContentType = Object.entries(contentTypeCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const lastUpdated = competitors
    .map(c => c.last_benchmark_update)
    .filter(Boolean)
    .sort()
    .reverse()[0] || null;

  return {
    total_active_campaigns: totalActiveCampaigns,
    average_spend: Math.round(averageSpend),
    top_content_type: topContentType,
    competitor_count: competitors.length,
    last_updated: lastUpdated
  };
};