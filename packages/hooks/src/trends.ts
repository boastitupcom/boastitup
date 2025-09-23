import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

// Types based on database schema
export interface TrendingTopic {
  id: string;
  tenant_id: string;
  brand_id: string;
  trend_name: string;
  trend_type: string;
  volume: number;
  growth_percentage: number;
  velocity_category: string;
  sentiment_score: number;
  primary_platform: string;
  related_hashtags: string[];
  hashtag_display: string;
  product_id?: string;
  product_name?: string;
  trending_indicator: string;
}

export interface CompetitorData {
  id: string;
  brand_id: string;
  competitor_id: string;
  competitor_type: 'direct' | 'aspirational' | 'industry_leader';
  include_for_avg: boolean;
}

// Hook to get trending topics with platform filtering
export const useTrendingTopicsWithPlatformFilter = (brandId: string, platform?: string, productId?: string) => {
  return useQuery({
    queryKey: ['trending-topics-filtered', brandId, platform, productId],
    queryFn: async () => {
      let query = supabase
        .from('v_trending_topics_view')
        .select('*')
        .eq('brand_id', brandId)
        .order('growth_percentage', { ascending: false });

      if (platform && platform !== 'all') {
        query = query.eq('primary_platform', platform);
      }

      if (productId && productId !== 'all') {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data as TrendingTopic[];
    },
    enabled: !!brandId,
  });
};

// Hook to get platform options from dim_platform
export const usePlatformOptions = () => {
  return useQuery({
    queryKey: ['platform-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dim_platform')
        .select('name, display_name, category')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data;
    },
  });
};

// Hook to get product-specific hashtags
export const useProductHashtags = (brandId: string, productId?: string) => {
  return useQuery({
    queryKey: ['product-hashtags', brandId, productId],
    queryFn: async () => {
      if (!productId || productId === 'all') return [];

      const { data, error } = await supabase
        .from('v_trending_topics_view')
        .select('related_hashtags')
        .eq('brand_id', brandId)
        .eq('product_id', productId)
        .not('related_hashtags', 'is', null);

      if (error) throw error;

      // Flatten and deduplicate hashtags
      const allHashtags = data.flatMap(item => item.related_hashtags || []);
      return [...new Set(allHashtags)];
    },
    enabled: !!brandId && !!productId && productId !== 'all',
  });
};

// Hook to get competitor analysis data
export const useCompetitorAnalysis = (brandId: string, productId?: string) => {
  return useQuery({
    queryKey: ['competitor-analysis', brandId, productId],
    queryFn: async () => {
      let query = supabase
        .from('brand_competitors')
        .select(`
          *,
          competitor:competitors!brand_competitors_competitor_id_fkey(
            brand_name,
            industry_id
          )
        `)
        .eq('brand_id', brandId);

      // Note: Will need to add product_id filter when brand_competitors table is updated
      // for product-level competitor tracking as mentioned in the story

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });
};

// Hook to get content mix strategy data for competitors
export const useCompetitorContentMix = (brandId: string, competitorType?: string) => {
  return useQuery({
    queryKey: ['competitor-content-mix', brandId, competitorType],
    queryFn: async () => {
      // This would need to be implemented based on content performance data
      // For now, returning mock structure that matches the UI mockup
      return {
        video_content: 65,
        carousel_posts: 45,
        stories: 30
      };
    },
    enabled: !!brandId,
  });
};

// Hook to get audience overlap data
export const useAudienceOverlap = (brandId: string, competitorId?: string) => {
  return useQuery({
    queryKey: ['audience-overlap', brandId, competitorId],
    queryFn: async () => {
      // This would be calculated from audience data when available
      // For now, returning structure for the competitor analysis UI
      return {
        'eco_tech_solutions': 65,
        'green_future_co': 40
      };
    },
    enabled: !!brandId,
  });
};

// Extended hashtag performance data for matrix visualization
export interface HashtagPerformanceData {
  id: string;
  hashtag: string;
  volume: number;
  growth_percentage: number;
  competition_level: 'low' | 'medium' | 'high';
  performance_level: 'low' | 'medium' | 'high';
  sentiment_score?: number;
  engagement_rate?: number;
}

// Hook to get hashtag performance matrix data using real competition analysis
export const useHashtagPerformanceMatrix = (brandId: string, platform?: string, productId?: string) => {
  return useQuery({
    queryKey: ['hashtag-performance-matrix', brandId, platform, productId],
    queryFn: async () => {
      // Get trending topics with related hashtags
      let trendsQuery = supabase
        .from('v_trending_topics_view')
        .select('*')
        .eq('brand_id', brandId)
        .not('related_hashtags', 'is', null)
        .order('opportunity_score', { ascending: false });

      if (platform && platform !== 'all') {
        trendsQuery = trendsQuery.eq('primary_platform', platform);
      }

      if (productId && productId !== 'all') {
        trendsQuery = trendsQuery.eq('product_id', productId);
      }

      const { data: trendsData, error: trendsError } = await trendsQuery.limit(20);
      if (trendsError) throw trendsError;

      // Get competitor data for competition analysis
      const { data: competitorData, error: competitorError } = await supabase
        .from('brand_competitors')
        .select('*')
        .eq('brand_id', brandId)
        .eq('include_for_avg', true);

      if (competitorError) throw competitorError;

      // Transform trending topics into hashtag performance data using real metrics
      const hashtagData: HashtagPerformanceData[] = [];

      trendsData?.forEach(topic => {
        const hashtags = topic.related_hashtags || [];
        hashtags.forEach((hashtag: string, index: number) => {
          // Use real data-based competition and performance levels
          const competition_level: 'low' | 'medium' | 'high' =
            topic.race_position <= 10 ? 'high' :
            topic.race_position <= 50 ? 'medium' : 'low';

          const performance_level: 'low' | 'medium' | 'high' =
            topic.opportunity_score >= 70 ? 'high' :
            topic.opportunity_score >= 40 ? 'medium' : 'low';

          // Use actual volume from the topic (already hashtag-specific in many cases)
          const hashtagVolume = topic.volume;

          hashtagData.push({
            id: `${topic.id}-${index}`,
            hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
            volume: hashtagVolume,
            growth_percentage: topic.growth_percentage,
            competition_level,
            performance_level,
            sentiment_score: topic.sentiment_score,
            engagement_rate: topic.velocity_score // Use velocity score as engagement rate proxy
          });
        });
      });

      return hashtagData;
    },
    enabled: !!brandId,
  });
};

// Hook to get enhanced trending topics with platform and product filters
export const useTrendsWithFilters = (brandId: string, filters: {
  platforms: string[];
  productId?: string;
  category?: string;
  trendType?: string;
  minVolume?: number;
}) => {
  return useQuery({
    queryKey: ['trends-with-filters', brandId, filters],
    queryFn: async () => {
      let query = supabase
        .from('v_trending_topics_view')
        .select('*')
        .eq('brand_id', brandId)
        .order('growth_percentage', { ascending: false });

      // Apply platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes('all')) {
        query = query.in('primary_platform', filters.platforms);
      }

      // Apply product filter
      if (filters.productId && filters.productId !== 'all') {
        query = query.eq('product_id', filters.productId);
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      // Apply trend type filter
      if (filters.trendType) {
        query = query.eq('trend_type', filters.trendType);
      }

      // Apply minimum volume filter
      if (filters.minVolume) {
        query = query.gte('volume', filters.minVolume);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as TrendingTopic[];
    },
    enabled: !!brandId,
  });
};