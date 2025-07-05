'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';

// Types matching the database schema
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
  content_mix: {
    reels: number;
    photos: number;
    carousels: number;
  };
  audience_demographics: {
    age_groups: Record<string, number>;
    gender: Record<string, number>;
    top_locations: string[];
  };
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
  post_type: 'reel' | 'photo' | 'carousel';
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

// Main hook for Instagram Analysis
export function useInstagramAnalysis(brandId: string | null, dateRange: string = '30d') {
  const [data, setData] = useState<InstagramDashboardData>({
    analysis: null,
    posts: [],
    hashtags: [],
    trends: null,
    loading: true,
    error: null
  });

  const supabase = createClient();

  const loadData = useCallback(async () => {
    if (!brandId) {
      setData(prev => ({ ...prev, loading: false, error: 'No brand ID provided' }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get latest analysis
      const { data: analysis, error: analysisError } = await supabase
        .from('instagram_analysis')
        .select('*')
        .eq('brand_id', brandId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisError) throw analysisError;

      if (!analysis) {
        setData(prev => ({ ...prev, loading: false, error: 'No analysis data found' }));
        return;
      }

      // Get posts for this analysis
      const { data: posts, error: postsError } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('analysis_id', analysis.id)
        .order('viral_score', { ascending: false });

      if (postsError) throw postsError;

      // Get hashtags for this analysis
      const { data: hashtags, error: hashtagsError } = await supabase
        .from('instagram_hashtags')
        .select('*')
        .eq('analysis_id', analysis.id)
        .order('avg_engagement_rate', { ascending: false });

      if (hashtagsError) throw hashtagsError;

      // Get latest trends for fitness industry
      const { data: trends, error: trendsError } = await supabase
        .from('instagram_trends')
        .select('*')
        .eq('industry', 'fitness')
        .order('trend_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trendsError) throw trendsError;

      setData({
        analysis,
        posts: posts || [],
        hashtags: hashtags || [],
        trends,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading Instagram analysis:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [brandId, dateRange, supabase]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    refreshData
  };
}

// Hook for real-time data updates
export function useInstagramAnalysisRealtime(brandId: string | null) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!brandId) return;

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('instagram_analysis_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instagram_analysis',
          filter: `brand_id=eq.${brandId}`
        },
        (payload) => {
          console.log('Instagram analysis updated:', payload);
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [brandId, supabase]);

  return { lastUpdated };
}

// Hook for exporting data
export function useInstagramAnalysisExport() {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = useCallback(async (data: InstagramDashboardData) => {
    setExporting(true);
    try {
      const csvData = [
        ['Metric', 'Value', 'Change'],
        ['Followers', data.analysis?.followers_count || 0, `${data.analysis?.followers_growth_rate || 0}%`],
        ['Engagement Rate', `${data.analysis?.engagement_rate || 0}%`, `${data.analysis?.engagement_rate_change || 0}%`],
        ['Monthly Reach', data.analysis?.monthly_reach || 0, `${data.analysis?.monthly_reach_change || 0}%`],
        ['Profile Visits', data.analysis?.profile_visits || 0, `${data.analysis?.profile_visits_change || 0}%`],
        ['Health Score', `${data.analysis?.health_score || 0}/10`, data.analysis?.health_score_grade || ''],
        [],
        ['Top Posts'],
        ['Post Type', 'Engagement Rate', 'Views', 'Viral Score'],
        ...data.posts.filter(p => p.is_top_performer).map(post => [
          post.post_type,
          `${post.engagement_rate}%`,
          post.views_count,
          post.viral_score
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instagram-analysis-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportToCSV,
    exporting
  };
}

// Hook for managing AI recommendations
export function useInstagramRecommendations(analysisId: string | null) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const refreshRecommendations = useCallback(async () => {
    if (!analysisId) return;

    setLoading(true);
    try {
      // TODO: Call your AI service to generate new recommendations
      // For now, this would update the ai_recommendations JSONB field
      
      const newRecommendations = [
        {
          type: 'engagement_boost',
          title: '📈 Boost Engagement',
          description: 'Post Reels on Tuesday 6-8 PM using trending audio',
          expected_impact: '+15% engagement',
          priority: 'high'
        },
        {
          type: 'content_strategy', 
          title: '🎯 Content Strategy',
          description: 'Create "Myth vs Fact" carousel series about trending topics',
          expected_impact: '+25% reach',
          priority: 'high'
        }
      ];

      // Update recommendations in database
      const { error } = await supabase
        .from('instagram_analysis')
        .update({ ai_recommendations: newRecommendations })
        .eq('id', analysisId);

      if (error) throw error;

    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [analysisId, supabase]);

  const markRecommendationAsImplemented = useCallback(async (recommendationIndex: number) => {
    if (!analysisId) return;

    try {
      // Get current analysis
      const { data: analysis, error: fetchError } = await supabase
        .from('instagram_analysis')
        .select('ai_recommendations')
        .eq('id', analysisId)
        .single();

      if (fetchError) throw fetchError;

      // Mark recommendation as implemented
      const recommendations = [...(analysis.ai_recommendations || [])];
      if (recommendations[recommendationIndex]) {
        recommendations[recommendationIndex] = {
          ...recommendations[recommendationIndex],
          implemented: true,
          implemented_at: new Date().toISOString()
        };

        // Update in database
        const { error } = await supabase
          .from('instagram_analysis')
          .update({ ai_recommendations: recommendations })
          .eq('id', analysisId);

        if (error) throw error;
      }

    } catch (error) {
      console.error('Failed to mark recommendation as implemented:', error);
      throw error;
    }
  }, [analysisId, supabase]);

  return {
    refreshRecommendations,
    markRecommendationAsImplemented,
    loading
  };
}

export default useInstagramAnalysis;