import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import type { TrendingTopic } from '@boastitup/types';

const supabase = createClient();

// Hook to get trending topics with platform filtering
export const useTrendingTopicsWithPlatformFilter = (brandId: string, platform?: string, productId?: string) => {
  return useQuery({
    queryKey: ['trending-topics-filtered', brandId, platform, productId],
    queryFn: async () => {
      let query = supabase
        .from('v_trending_topics_view')
        .select(`
          id,
          tenant_id,
          brand_id,
          trend_name,
          trend_type,
          volume,
          growth_percentage,
          velocity_category,
          sentiment_score,
          primary_platform,
          related_hashtags,
          hashtag_display,
          product_id,
          product_name,
          trending_indicator,
          status,
          opportunity_score,
          race_position,
          volume_change_24h,
          volume_change_7d,
          velocity_score,
          confidence_score,
          primary_region,
          related_keywords,
          trend_date,
          trend_start_date,
          category_id,
          subcategory_id,
          created_at,
          updated_at
        `)
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

// Hook to get enhanced trending topics with multiple filters
export const useTrendsWithFilters = (brandId: string, filters: {
  platforms: string[];
  productId?: string;
  category?: string;
  trendType?: string;
  minVolume?: number;
  trendStatus?: string[];
}) => {
  return useQuery({
    queryKey: ['trends-with-filters', brandId, filters],
    queryFn: async () => {
      let query = supabase
        .from('v_trending_topics_view')
        .select(`
          id,
          tenant_id,
          brand_id,
          trend_name,
          trend_type,
          volume,
          growth_percentage,
          velocity_category,
          sentiment_score,
          primary_platform,
          related_hashtags,
          hashtag_display,
          product_id,
          product_name,
          trending_indicator,
          status,
          opportunity_score,
          race_position,
          volume_change_24h,
          volume_change_7d,
          velocity_score,
          confidence_score,
          primary_region,
          related_keywords,
          trend_date,
          trend_start_date,
          category_id,
          subcategory_id,
          created_at,
          updated_at
        `)
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

      // Apply trend status filter
      if (filters.trendStatus && filters.trendStatus.length > 0) {
        query = query.in('status', filters.trendStatus);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as TrendingTopic[];
    },
    enabled: !!brandId,
  });
};