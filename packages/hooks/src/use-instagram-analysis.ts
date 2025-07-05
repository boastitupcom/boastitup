// packages/hooks/src/use-instagram-analysis.ts - Updated with industry support
import { useState, useEffect } from 'react';
import { createClient } from '@boastitup/supabase/client';

// Types
export interface InstagramAnalysis {
  id: string;
  tenant_id: string;
  brand_id: string;
  instagram_handle: string;
  analysis_date: string;
  data_period_start: string;
  data_period_end: string;
  health_score: number;
  health_score_grade: string;
  followers_count: number;
  followers_growth_rate: number;
  followers_growth_absolute: number;
  engagement_rate: number;
  engagement_rate_change: number;
  monthly_reach: number;
  monthly_reach_change: number;
  profile_visits: number;
  profile_visits_change: number;
  total_posts: number;
  avg_likes_per_post: number;
  avg_comments_per_post: number;
  avg_shares_per_post: number;
  content_mix: Record<string, any>;
  audience_demographics: Record<string, any>;
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  positive_keywords: string[];
  negative_keywords: string[];
  neutral_keywords: string[];
  best_posting_times: Array<{
    day: string;
    time_range: string;
    avg_engagement: number;
  }>;
  ai_recommendations: Array<{
    type: string;
    title: string;
    description: string;
    expected_impact: string;
    priority: string;
  }>;
  dashboard_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InstagramPost {
  id: string;
  analysis_id: string;
  tenant_id: string;
  brand_id: string;
  instagram_post_id: string;
  post_url: string;
  post_type: string;
  post_date: string;
  caption: string;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  views_count: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  viral_score: number;
  trending_audio?: string;
  viral_factors: string[];
  thumbnail_url?: string;
  preview_text?: string;
  is_top_performer: boolean;
  performance_rank?: number;
  created_at: string;
  updated_at: string;
}

export interface InstagramHashtag {
  id: string;
  analysis_id: string;
  tenant_id: string;
  brand_id: string;
  hashtag: string;
  hashtag_type: 'brand' | 'community' | 'niche' | 'trending';
  usage_count: number;
  avg_engagement_rate: number;
  total_reach: number;
  total_impressions: number;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  performance_rank?: number;
  is_recommended: boolean;
  created_at: string;
}

export interface InstagramTrends {
  id: string;
  trend_date: string;
  industry: string;
  trending_audios: Array<{
    name: string;
    usage_count: number;
    trend_score: number;
  }>;
  hot_topics: Array<{
    topic: string;
    mentions: number;
    growth: string;
    sentiment: string;
  }>;
  viral_content_formats: Array<{
    format: string;
    engagement_rate: number;
    growth: string;
  }>;
  competitor_insights: {
    top_performers: Array<{
      handle: string;
      followers: number;
      engagement_rate: number;
      growth: number;
      strategy: string;
    }>;
    industry_averages: {
      engagement_rate: number;
      follower_growth: number;
    };
  };
  created_at: string;
}

export interface InstagramDashboardData {
  analysis: InstagramAnalysis | null;
  posts: InstagramPost[];
  hashtags: InstagramHashtag[];
  trends: InstagramTrends | null;
  loading: boolean;
  error: string | null;
}

// Utility functions
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatPercentage = (num: number): string => {
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
};

export const getTrendColor = (change: number): string => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 5.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const getRecommendationColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'bg-red-50 border-red-200 text-red-800';
    case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'low': return 'bg-green-50 border-green-200 text-green-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

// Enhanced hook with industry-aware trends
export function useInstagramAnalysis(brandId: string | null, dateRange: string = '30d') {
  const [data, setData] = useState<InstagramDashboardData>({
    analysis: null,
    posts: [],
    hashtags: [],
    trends: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchInstagramData() {
      if (!brandId) {
        setData(prev => ({ ...prev, loading: false, error: 'No brand selected' }));
        return;
      }

      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch the latest analysis for the brand
        const { data: analysisData, error: analysisError } = await supabase
          .from('instagram_analysis')
          .select('*')
          .eq('brand_id', brandId)
          .order('analysis_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError) throw analysisError;

        let postsData: InstagramPost[] = [];
        let hashtagsData: InstagramHashtag[] = [];

        // If we have analysis data, fetch related posts and hashtags
        if (analysisData) {
          const [postsResult, hashtagsResult] = await Promise.all([
            supabase
              .from('instagram_posts')
              .select('*')
              .eq('analysis_id', analysisData.id)
              .order('viral_score', { ascending: false })
              .limit(10),
            supabase
              .from('instagram_hashtags')
              .select('*')
              .eq('analysis_id', analysisData.id)
              .order('avg_engagement_rate', { ascending: false })
              .limit(10)
          ]);

          if (postsResult.error) throw postsResult.error;
          if (hashtagsResult.error) throw hashtagsResult.error;

          postsData = postsResult.data || [];
          hashtagsData = hashtagsResult.data || [];
        }

        // Fetch industry-specific trends using the database function
        const { data: trendsData, error: trendsError } = await supabase
          .rpc('get_industry_trends', { brand_id: brandId });

        if (trendsError) {
          console.warn('Could not fetch industry trends:', trendsError);
        }

        // If no industry-specific trends found, fetch default fitness trends
        let finalTrendsData = trendsData?.[0] || null;
        
        if (!finalTrendsData) {
          const { data: defaultTrends } = await supabase
            .from('instagram_trends')
            .select('*')
            .eq('industry', 'fitness')
            .order('trend_date', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          finalTrendsData = defaultTrends;
        }

        setData({
          analysis: analysisData,
          posts: postsData,
          hashtags: hashtagsData,
          trends: finalTrendsData,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching Instagram data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    }

    fetchInstagramData();
  }, [brandId, dateRange, supabase]);

  return data;
}

// Hook to fetch available industries
export function useIndustries() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchIndustries() {
      try {
        const { data, error } = await supabase
          .from('industries')
          .select('*')
          .order('name');

        if (error) throw error;

        setIndustries(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch industries');
      } finally {
        setLoading(false);
      }
    }

    fetchIndustries();
  }, [supabase]);

  return { industries, loading, error };
}

// Hook to get brand's industry
export function useBrandIndustry(brandId: string | null) {
  const [industry, setIndustry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchBrandIndustry() {
      if (!brandId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('brands')
          .select(`
            industry_id,
            industry:industries(name, slug)
          `)
          .eq('id', brandId)
          .single();

        if (error) throw error;

        setIndustry(data?.industry?.name || 'fitness');
      } catch (err) {
        console.error('Error fetching brand industry:', err);
        setIndustry('fitness'); // Default fallback
      } finally {
        setLoading(false);
      }
    }

    fetchBrandIndustry();
  }, [brandId, supabase]);

  return { industry, loading };
}