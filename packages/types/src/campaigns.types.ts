// Campaign types based on database schema definitions

// Enum types from database
export type CampaignPlatform =
  | 'facebook'
  | 'instagram'
  | 'google_ads'
  | 'tiktok'
  | 'twitter'
  | 'linkedin'
  | 'pinterest';

export type CampaignType =
  | 'organic'
  | 'hybrid'
  | 'paid';

export type CampaignStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type CampaignGoals =
  | 'awareness'
  | 'engagement'
  | 'conversions'
  | 'leads'
  | 'retention';

// Database table interfaces
export interface Campaign {
  id: string;
  tenant_id: string;
  brand_id: string;
  campaign_name: string;
  campaign_description?: string;
  campaign_status: CampaignStatus;
  campaign_start_date?: string;
  campaign_end_date?: string;
  campaign_goals?: CampaignGoals;
  campaign_predicted_reach_min?: number;
  campaign_predicted_reach_max?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  is_deleted: boolean;
  product_id?: string;
  campaign_type?: CampaignType;
  campaign_platform?: CampaignPlatform;
  campaign_budget_allocated?: number;
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

// View interfaces for performance data
export interface CampaignGoalROI {
  brand_id: string;
  product_id?: string;
  campaign_goals: CampaignGoals;
  total_revenue: number;
  total_investment: number;
  roi: number;
}

export interface CampaignTypePerformance {
  brand_id: string;
  product_id?: string;
  campaign_type_enum: CampaignType;
  number_of_campaigns: number;
  total_revenue: number;
  total_investment: number;
  roi: number;
  total_impressions: number;
  total_reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_conversions: number;
  cost_per_conversion: number;
}

// UI display interfaces
export interface CampaignGoalOption {
  id: string;
  type: CampaignGoals;
  label: string;
  description: string;
  roi_percentage: number;
  icon_name: string;
  IconComponent?: any;
  ai_recommended?: boolean;
  selected: boolean;
}

export interface CampaignTypeOption {
  id: string;
  type: CampaignType;
  label: string;
  description: string;
  roi_percentage: number;
  campaigns_count: number;
  icon_name: string;
  IconComponent?: any;
  ai_recommended: boolean;
  selected: boolean;
}

// Form data interface
export interface CampaignFormData {
  campaign_name: string;
  campaign_goals: CampaignGoals | '';
  campaign_type: CampaignType | '';
  campaign_description: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_budget_allocated: number;
}

// Service response interfaces
export interface CampaignGoalResponse {
  id: string;
  type: string;
  label: string;
  description: string;
  roi_percentage: number;
  icon_name: string;
  ai_recommended: boolean;
}

export interface CampaignTypeResponse {
  id: string;
  type: string;
  label: string;
  description: string;
  roi_percentage: number;
  campaigns_count: number;
  ai_recommended: boolean;
}

// Currency interface
export interface BrandCurrency {
  currency_code: string;
  currency_symbol: string;
}