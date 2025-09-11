// packages/types/src/competitor-intelligence.types.ts
export type Platform = 
  | 'instagram' 
  | 'tiktok' 
  | 'twitter' 
  | 'linkedin' 
  | 'facebook';

export type CompetitorType = 
  | 'industry_leader' 
  | 'aspirational' 
  | 'direct' 
  | 'performance_specialist' 
  | 'value';

export interface TrendingTopic {
  id: string;
  brand_id: string;
  tenant_id: string;
  trend_name: string;
  trend_type: string;
  hashtag_display: string;
  growth_percentage: number;
  trending_indicator: string;
  volume: number;
  volume_change_24h: number;
  volume_change_7d: number;
  velocity_score: number;
  velocity_category: string;
  race_position: number;
  sentiment_score: number;
  confidence_score: number;
  opportunity_score: number;
  primary_platform: Platform;
  platform?: Platform;
  primary_region: string;
  related_hashtags: string[];
  related_keywords: string[];
  trend_date: string;
  trend_start_date: string;
  status: 'opportunity' | 'acting';
  category_id?: string;
  subcategory_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorIntelligence {
  id: string;
  competitor_name: string;
  tenant_id: string;
  brand_id: string;
  competitor_type: CompetitorType;
  active_campaigns: number;
  avg_spend_raw: number;
  avg_spend_display: string;
  top_content: string;
  last_benchmark_update: string;
  is_active: boolean;
  competitor_relationship_created_at: string;
  competitor_relationship_updated_at: string;
  // Additional intelligence fields
  avg_engagement_rate?: number;
  avg_reach?: number;
  budget_insight?: string;
  content_insight?: string;
  hashtags_insight?: string;
  timing_insight?: string;
}

export interface IntelligenceInsight {
  id: string;
  type: 'trend' | 'competitor' | 'opportunity';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggested_actions: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// UI Component props
export interface TrendingTopicCardProps {
  topic: TrendingTopic;
  onTopicSelect?: (topic: TrendingTopic) => void;
  showDetails?: boolean;
}

export interface CompetitorCardProps {
  competitor: CompetitorIntelligence;
  onCompetitorSelect?: (competitor: CompetitorIntelligence) => void;
  showInsights?: boolean;
}

export interface IntelligencePanelProps {
  brandId: string;
  isVisible: boolean;
  onToggleVisibility: (visible: boolean) => void;
  className?: string;
}

// Aggregated metrics types
export interface AggregatedCompetitorMetrics {
  total_active_campaigns: number;
  average_spend: number;
  top_content_type: string;
  competitor_count: number;
  last_updated: string | null;
}

export interface TrendMomentum {
  level: 'high' | 'medium' | 'low';
  score: number;
}

export interface CompetitiveAdvantage {
  advantage: 'higher' | 'competitive' | 'lower';
  percentage: number;
}

// Campaign context types  
export interface CampaignType {
  type: string;
  label: string;
  roi_percentage: number;
  icon_name: string;
  color?: string;
  bg_gradient?: string;
  description?: string;
}

export interface CampaignFormData {
  campaign_name: string;
  campaign_type: string;
  campaign_description: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_budget_allocated: number;
}

export interface BrandCurrency {
  currency_code: string;
  currency_symbol: string;
}

export interface CampaignDraft {
  id?: string;
  tenant_id: string;
  brand_id: string;
  created_by: string;
  campaign_name?: string;
  campaign_type?: string;
  campaign_description?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  campaign_budget_allocated?: number;
  campaign_platforms?: any[];
  campaign_content?: Record<string, any>;
  campaign_targeting?: Record<string, any>;
  step_completed: number;
  draft_status: 'in_progress' | 'step_1_complete' | 'step_2_complete' | 'step_3_complete' | 'completed';
  source_insight_id?: string;
  last_updated: string;
  created_at: string;
  expires_at: string;
}