// types/instagram-analysis.ts
export interface InstagramAnalysis {
  id: string;
  tenant_id: string;
  brand_id: string;
  instagram_handle: string;
  
  // Analysis metadata
  analysis_date: string;
  data_period_start: string;
  data_period_end: string;
  health_score: number;
  health_score_grade: 'Excellent' | 'Good' | 'Average' | 'Poor';
  
  // Core metrics
  followers_count: number;
  followers_growth_rate: number;
  followers_growth_absolute: number;
  engagement_rate: number;
  engagement_rate_change: number;
  monthly_reach: number;
  monthly_reach_change: number;
  profile_visits: number;
  profile_visits_change: number;
  
  // Content metrics
  total_posts: number;
  avg_likes_per_post: number;
  avg_comments_per_post: number;
  avg_shares_per_post: number;
  
  // JSON fields
  content_mix: ContentMix;
  audience_demographics: AudienceDemographics;
  
  // Sentiment
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  positive_keywords: string[];
  negative_keywords: string[];
  neutral_keywords: string[];
  
  // Insights
  best_posting_times: BestPostingTime[];
  ai_recommendations: AIRecommendation[];
  dashboard_config: DashboardConfig;
  
  created_at: string;
  updated_at: string;
}

export interface ContentMix {
  reels: number;
  photos: number;
  carousels: number;
}

export interface AudienceDemographics {
  age_groups: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45+': number;
  };
  gender: {
    male: number;
    female: number;
  };
  top_locations: string[];
}

export interface BestPostingTime {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time_range: string;
  avg_engagement: number;
}

export interface AIRecommendation {
  type: 'engagement_boost' | 'content_strategy' | 'community_building' | 'viral_potential';
  title: string;
  description: string;
  expected_impact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardConfig {
  theme?: 'light' | 'dark';
  color_scheme?: string[];
  chart_preferences?: Record<string, any>;
  svg_customizations?: Record<string, any>;
}

export interface InstagramPost {
  id: string;
  analysis_id: string;
  tenant_id: string;
  brand_id: string;
  
  // Post identification
  instagram_post_id: string;
  post_url: string;
  post_type: 'reel' | 'photo' | 'carousel';
  
  // Metadata
  post_date: string;
  caption: string;
  hashtags: string[];
  
  // Performance
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  views_count: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  viral_score: number;
  
  // Content analysis
  trending_audio?: string;
  viral_factors: string[];
  thumbnail_url?: string;
  preview_text?: string;
  
  // Performance ranking
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
  
  // Performance
  usage_count: number;
  avg_engagement_rate: number;
  total_reach: number;
  total_impressions: number;
  
  // Trends
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
  trending_audios: TrendingAudio[];
  hot_topics: HotTopic[];
  viral_content_formats: ViralContentFormat[];
  competitor_insights: CompetitorInsights;
  created_at: string;
}

export interface TrendingAudio {
  name: string;
  usage_count: number;
  trend_score: number;
}

export interface HotTopic {
  topic: string;
  mentions: number;
  growth: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ViralContentFormat {
  format: string;
  engagement_rate: number;
  growth: string;
}

export interface CompetitorInsights {
  top_performers: CompetitorData[];
  industry_averages: {
    engagement_rate: number;
    follower_growth: number;
  };
}

export interface CompetitorData {
  handle: string;
  followers: number;
  engagement_rate: number;
  growth: number;
  strategy?: string;
}

// Helper functions for data manipulation
export class InstagramAnalysisHelper {
  
  /**
   * Calculate health score based on various metrics
   */
  static calculateHealthScore(data: Partial<InstagramAnalysis>): number {
    const weights = {
      engagement_rate: 0.3,
      followers_growth_rate: 0.2,
      reach_growth: 0.2,
      content_consistency: 0.15,
      sentiment_positive: 0.15
    };
    
    let score = 0;
    
    // Engagement rate scoring (0-10 scale)
    if (data.engagement_rate) {
      const engagementScore = Math.min(data.engagement_rate / 10 * 10, 10);
      score += engagementScore * weights.engagement_rate;
    }
    
    // Growth rate scoring
    if (data.followers_growth_rate) {
      const growthScore = Math.min(Math.max(data.followers_growth_rate / 5 * 10, 0), 10);
      score += growthScore * weights.followers_growth_rate;
    }
    
    // Reach growth scoring
    if (data.monthly_reach_change) {
      const reachScore = Math.min(Math.max(data.monthly_reach_change / 10 * 10, 0), 10);
      score += reachScore * weights.reach_growth;
    }
    
    // Content consistency (based on posting frequency)
    if (data.total_posts) {
      const consistencyScore = Math.min(data.total_posts / 30 * 10, 10); // 30 posts per month = perfect
      score += consistencyScore * weights.content_consistency;
    }
    
    // Sentiment scoring
    if (data.sentiment_positive) {
      const sentimentScore = data.sentiment_positive / 10; // Convert percentage to 0-10 scale
      score += sentimentScore * weights.sentiment_positive;
    }
    
    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Get health score grade
   */
  static getHealthScoreGrade(score: number): string {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.0) return 'Good';
    if (score >= 5.0) return 'Average';
    return 'Poor';
  }
  
  /**
   * Generate AI recommendations based on analysis data
   */
  static generateRecommendations(data: InstagramAnalysis, trends: InstagramTrends): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Engagement boost recommendation
    if (data.engagement_rate < 6) {
      const bestTime = data.best_posting_times[0];
      recommendations.push({
        type: 'engagement_boost',
        title: '📈 Boost Engagement',
        description: `Post Reels on ${bestTime?.day} ${bestTime?.time_range} using trending audio "${trends.trending_audios[0]?.name}"`,
        expected_impact: '+15% engagement',
        priority: 'high'
      });
    }
    
    // Content strategy recommendation
    const topTopic = trends.hot_topics[0];
    if (topTopic) {
      recommendations.push({
        type: 'content_strategy',
        title: '🎯 Content Strategy',
        description: `Create "Myth vs Fact" carousel series about ${topTopic.topic} - trending topic`,
        expected_impact: '+25% reach',
        priority: 'high'
      });
    }
    
    // Community building
    if (data.sentiment_negative > 5) {
      recommendations.push({
        type: 'community_building',
        title: '💬 Community Building',
        description: 'Respond to common questions in comments with FAQ highlight story',
        expected_impact: '+30% conversion',
        priority: 'medium'
      });
    }
    
    // Viral potential
    recommendations.push({
      type: 'viral_potential',
      title: '🔥 Viral Potential',
      description: 'Launch UGC campaign: Customer transformation videos with branded hashtag',
      expected_impact: 'Viral potential',
      priority: 'medium'
    });
    
    return recommendations;
  }
  
  /**
   * Format numbers for display
   */
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
  
  /**
   * Format percentage with sign
   */
  static formatPercentage(num: number): string {
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  }
  
  /**
   * Get trend color based on change
   */
  static getTrendColor(change: number): string {
    if (change > 0) return '#10b981'; // Green
    if (change < 0) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }
  
  /**
   * Parse posting pattern into heatmap data
   */
  static generatePostingHeatmap(posts: InstagramPost[]): Array<{day: number, hour: number, intensity: number}> {
    const heatmapData: Array<{day: number, hour: number, intensity: number, count: number}> = [];
    
    // Initialize grid
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({ day, hour, intensity: 0, count: 0 });
      }
    }
    
    // Populate with post data
    posts.forEach(post => {
      const date = new Date(post.post_date);
      const day = date.getDay();
      const hour = date.getHours();
      
      const cell = heatmapData.find(d => d.day === day && d.hour === hour);
      if (cell) {
        cell.count++;
        cell.intensity += post.engagement_rate;
      }
    });
    
    // Calculate average intensity
    heatmapData.forEach(cell => {
      if (cell.count > 0) {
        cell.intensity = cell.intensity / cell.count;
      }
    });
    
    return heatmapData;
  }
  
  /**
   * Convert database data to SVG dashboard data
   */
  static prepareSVGDashboardData(analysis: InstagramAnalysis, posts: InstagramPost[], hashtags: InstagramHashtag[], trends: InstagramTrends) {
    return {
      // Health metrics
      healthScore: analysis.health_score,
      healthGrade: analysis.health_score_grade,
      
      // Core metrics
      followers: this.formatNumber(analysis.followers_count),
      followersGrowth: this.formatPercentage(analysis.followers_growth_rate),
      engagementRate: `${analysis.engagement_rate}%`,
      engagementChange: this.formatPercentage(analysis.engagement_rate_change),
      monthlyReach: this.formatNumber(analysis.monthly_reach),
      reachChange: this.formatPercentage(analysis.monthly_reach_change),
      profileVisits: this.formatNumber(analysis.profile_visits),
      visitsChange: this.formatPercentage(analysis.profile_visits_change),
      
      // Content mix
      contentMix: analysis.content_mix,
      
      // Top posts
      topPosts: posts
        .filter(p => p.is_top_performer)
        .slice(0, 4)
        .map(p => ({
          type: p.post_type,
          views: this.formatNumber(p.views_count || p.reach),
          engagement: `${p.engagement_rate}%`,
          title: p.preview_text || `${p.post_type} content`,
          factor: p.viral_factors[0] || 'trending'
        })),
      
      // Sentiment
      sentiment: {
        positive: analysis.sentiment_positive,
        neutral: analysis.sentiment_neutral,
        negative: analysis.sentiment_negative
      },
      
      // Keywords
      keywords: {
        positive: analysis.positive_keywords,
        neutral: analysis.neutral_keywords,
        negative: analysis.negative_keywords
      },
      
      // Demographics
      demographics: analysis.audience_demographics,
      
      // Best posting times
      bestPostingTimes: analysis.best_posting_times,
      
      // Top hashtags by category
      hashtags: {
        brand: hashtags.filter(h => h.hashtag_type === 'brand').slice(0, 3),
        community: hashtags.filter(h => h.hashtag_type === 'community').slice(0, 5),
        niche: hashtags.filter(h => h.hashtag_type === 'niche').slice(0, 5)
      },
      
      // Trending data
      trends: {
        audios: trends.trending_audios.slice(0, 3),
        topics: trends.hot_topics.slice(0, 4),
        formats: trends.viral_content_formats.slice(0, 4)
      },
      
      // AI recommendations
      recommendations: analysis.ai_recommendations,
      
      // Posting heatmap
      heatmap: this.generatePostingHeatmap(posts)
    };
  }
}

// Supabase helper functions
export class InstagramAnalysisDB {
  
  /**
   * Insert or update Instagram analysis data
   */
  static async upsertAnalysis(
    supabase: any,
    data: Omit<InstagramAnalysis, 'id' | 'created_at' | 'updated_at'>
  ): Promise<InstagramAnalysis> {
    const { data: result, error } = await supabase
      .from('instagram_analysis')
      .upsert(data, {
        onConflict: 'brand_id,analysis_date',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
  
  /**
   * Insert multiple posts for an analysis
   */
  static async insertPosts(
    supabase: any,
    posts: Omit<InstagramPost, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<InstagramPost[]> {
    const { data: result, error } = await supabase
      .from('instagram_posts')
      .insert(posts)
      .select();
    
    if (error) throw error;
    return result;
  }
  
  /**
   * Insert hashtag performance data
   */
  static async insertHashtags(
    supabase: any,
    hashtags: Omit<InstagramHashtag, 'id' | 'created_at'>[]
  ): Promise<InstagramHashtag[]> {
    const { data: result, error } = await supabase
      .from('instagram_hashtags')
      .upsert(hashtags, {
        onConflict: 'analysis_id,hashtag',
        ignoreDuplicates: false
      })
      .select();
    
    if (error) throw error;
    return result;
  }
  
  /**
   * Get latest analysis for a brand
   */
  static async getLatestAnalysis(
    supabase: any,
    brandId: string
  ): Promise<InstagramAnalysis | null> {
    const { data, error } = await supabase
      .from('instagram_analysis')
      .select('*')
      .eq('brand_id', brandId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Get posts for an analysis
   */
  static async getAnalysisPosts(
    supabase: any,
    analysisId: string
  ): Promise<InstagramPost[]> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('viral_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  /**
   * Get hashtags for an analysis
   */
  static async getAnalysisHashtags(
    supabase: any,
    analysisId: string
  ): Promise<InstagramHashtag[]> {
    const { data, error } = await supabase
      .from('instagram_hashtags')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('avg_engagement_rate', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  /**
   * Get latest trends for industry
   */
  static async getLatestTrends(
    supabase: any,
    industry: string = 'fitness'
  ): Promise<InstagramTrends | null> {
    const { data, error } = await supabase
      .from('instagram_trends')
      .select('*')
      .eq('industry', industry)
      .order('trend_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Get complete dashboard data for a brand
   */
  static async getDashboardData(
    supabase: any,
    brandId: string,
    industry: string = 'fitness'
  ): Promise<{
    analysis: InstagramAnalysis;
    posts: InstagramPost[];
    hashtags: InstagramHashtag[];
    trends: InstagramTrends;
    svgData: any;
  } | null> {
    try {
      // Get latest analysis
      const analysis = await this.getLatestAnalysis(supabase, brandId);
      if (!analysis) return null;
      
      // Get related data
      const [posts, hashtags, trends] = await Promise.all([
        this.getAnalysisPosts(supabase, analysis.id),
        this.getAnalysisHashtags(supabase, analysis.id),
        this.getLatestTrends(supabase, industry)
      ]);
      
      // Prepare SVG dashboard data
      const svgData = InstagramAnalysisHelper.prepareSVGDashboardData(
        analysis,
        posts,
        hashtags,
        trends || {} as InstagramTrends
      );
      
      return {
        analysis,
        posts,
        hashtags,
        trends: trends || {} as InstagramTrends,
        svgData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
  
  /**
   * Store analysis history for tracking changes
   */
  static async storeAnalysisHistory(
    supabase: any,
    brandId: string,
    tenantId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const historyEntries = Object.entries(metrics).map(([metricName, metricValue]) => ({
      brand_id: brandId,
      tenant_id: tenantId,
      metric_name: metricName,
      metric_value: metricValue,
      metric_date: new Date().toISOString().split('T')[0],
      metric_category: this.getMetricCategory(metricName)
    }));
    
    const { error } = await supabase
      .from('instagram_analysis_history')
      .upsert(historyEntries, {
        onConflict: 'brand_id,metric_name,metric_date',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
  }
  
  /**
   * Get metric category for history tracking
   */
  private static getMetricCategory(metricName: string): string {
    const categories = {
      followers_count: 'audience',
      engagement_rate: 'performance',
      monthly_reach: 'performance',
      profile_visits: 'performance',
      total_posts: 'content',
      avg_likes_per_post: 'content',
      sentiment_positive: 'audience'
    };
    
    return categories[metricName as keyof typeof categories] || 'other';
  }
  
  /**
   * Generate sample data for testing
   */
  static generateSampleData(brandId: string, tenantId: string): {
    analysis: Omit<InstagramAnalysis, 'id' | 'created_at' | 'updated_at'>;
    posts: Omit<InstagramPost, 'id' | 'created_at' | 'updated_at'>[];
    hashtags: Omit<InstagramHashtag, 'id' | 'created_at'>[];
  } {
    const analysisId = 'sample-analysis-id';
    
    const analysis: Omit<InstagramAnalysis, 'id' | 'created_at' | 'updated_at'> = {
      tenant_id: tenantId,
      brand_id: brandId,
      instagram_handle: '@one.science.nutrition.in',
      analysis_date: new Date().toISOString().split('T')[0],
      data_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      data_period_end: new Date().toISOString().split('T')[0],
      health_score: 8.7,
      health_score_grade: 'Excellent',
      
      followers_count: 147200,
      followers_growth_rate: 5.2,
      followers_growth_absolute: 7300,
      engagement_rate: 6.8,
      engagement_rate_change: 1.3,
      monthly_reach: 2100000,
      monthly_reach_change: 12.4,
      profile_visits: 18500,
      profile_visits_change: 8.7,
      
      total_posts: 45,
      avg_likes_per_post: 8420.5,
      avg_comments_per_post: 156.8,
      avg_shares_per_post: 89.2,
      
      content_mix: { reels: 65, photos: 25, carousels: 10 },
      audience_demographics: {
        age_groups: { '18-24': 28, '25-34': 45, '35-44': 22, '45+': 5 },
        gender: { male: 68, female: 32 },
        top_locations: ['Mumbai', 'Delhi', 'Bangalore', 'Pune']
      },
      
      sentiment_positive: 82,
      sentiment_neutral: 15,
      sentiment_negative: 3,
      positive_keywords: ['great taste', 'effective', 'fast delivery', 'quality'],
      negative_keywords: ['expensive'],
      neutral_keywords: ['good', 'okay'],
      
      best_posting_times: [
        { day: 'tuesday', time_range: '18:00-20:00', avg_engagement: 8.2 },
        { day: 'sunday', time_range: '07:00-09:00', avg_engagement: 7.8 },
        { day: 'friday', time_range: '17:00-19:00', avg_engagement: 7.5 }
      ],
      
      ai_recommendations: InstagramAnalysisHelper.generateRecommendations(
        {} as InstagramAnalysis,
        {
          trending_audios: [{ name: 'Beast Mode Activated', usage_count: 1800000, trend_score: 89 }],
          hot_topics: [{ topic: 'creatine benefits', mentions: 150000, growth: '+25%', sentiment: 'positive' }]
        } as InstagramTrends
      ),
      
      dashboard_config: {}
    };
    
    const posts: Omit<InstagramPost, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        analysis_id: analysisId,
        tenant_id: tenantId,
        brand_id: brandId,
        instagram_post_id: 'post_1',
        post_url: 'https://instagram.com/p/sample1',
        post_type: 'reel',
        post_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        caption: 'Pre-workout tips that actually work! 💪',
        hashtags: ['preworkout', 'fitness', 'nutrition', 'onesciencenutrition'],
        likes_count: 12400,
        comments_count: 298,
        shares_count: 156,
        saves_count: 89,
        views_count: 89200,
        reach: 65000,
        impressions: 92000,
        engagement_rate: 12.3,
        viral_score: 8.9,
        trending_audio: 'Beast Mode Activated',
        viral_factors: ['trending_audio', 'educational'],
        thumbnail_url: '',
        preview_text: 'Pre-workout Tips',
        is_top_performer: true,
        performance_rank: 1
      },
      {
        analysis_id: analysisId,
        tenant_id: tenantId,
        brand_id: brandId,
        instagram_post_id: 'post_2',
        post_url: 'https://instagram.com/p/sample2',
        post_type: 'carousel',
        post_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        caption: 'Protein myths debunked! Swipe to learn the truth 👉',
        hashtags: ['protein', 'myths', 'facts', 'nutrition'],
        likes_count: 8900,
        comments_count: 167,
        shares_count: 89,
        saves_count: 234,
        views_count: 67500,
        reach: 45000,
        impressions: 58000,
        engagement_rate: 9.8,
        viral_score: 7.2,
        viral_factors: ['educational', 'carousel_format'],
        thumbnail_url: '',
        preview_text: 'Protein Myths',
        is_top_performer: true,
        performance_rank: 2
      }
    ];
    
    const hashtags: Omit<InstagramHashtag, 'id' | 'created_at'>[] = [
      {
        analysis_id: analysisId,
        tenant_id: tenantId,
        brand_id: brandId,
        hashtag: 'onesciencenutrition',
        hashtag_type: 'brand',
        usage_count: 25,
        avg_engagement_rate: 7.2,
        total_reach: 125000,
        total_impressions: 189000,
        trend_direction: 'up',
        trend_percentage: 5.2,
        performance_rank: 1,
        is_recommended: true
      },
      {
        analysis_id: analysisId,
        tenant_id: tenantId,
        brand_id: brandId,
        hashtag: 'fitfam',
        hashtag_type: 'community',
        usage_count: 18,
        avg_engagement_rate: 8.5,
        total_reach: 89000,
        total_impressions: 134000,
        trend_direction: 'up',
        trend_percentage: 2.1,
        performance_rank: 2,
        is_recommended: true
      },
      {
        analysis_id: analysisId,
        tenant_id: tenantId,
        brand_id: brandId,
        hashtag: 'creatine',
        hashtag_type: 'niche',
        usage_count: 12,
        avg_engagement_rate: 12.3,
        total_reach: 156000,
        total_impressions: 234000,
        trend_direction: 'up',
        trend_percentage: 25.4,
        performance_rank: 1,
        is_recommended: true
      }
    ];
    
    return { analysis, posts, hashtags };
  }
}

// React hook for Instagram Analysis
export function useInstagramAnalysis(brandId: string | null) {
  const [data, setData] = useState<{
    analysis: InstagramAnalysis | null;
    posts: InstagramPost[];
    hashtags: InstagramHashtag[];
    trends: InstagramTrends | null;
    svgData: any;
  }>({
    analysis: null,
    posts: [],
    hashtags: [],
    trends: null,
    svgData: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!brandId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // This would be your Supabase client
        const supabase = {} as any; // Replace with actual Supabase client
        
        const dashboardData = await InstagramAnalysisDB.getDashboardData(supabase, brandId);
        
        if (dashboardData) {
          setData(dashboardData);
        } else {
          setError('No analysis data found for this brand');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [brandId]);
  
  const refetch = () => {
    if (brandId) {
      // Trigger refetch logic here
    }
  };
  
  return { data, loading, error, refetch };
}