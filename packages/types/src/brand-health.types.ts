// Brand Health Dashboard Types

export interface BrandHealthScore {
  id: string;
  brand_id: string;
  tenant_id: string;
  calculation_date: string;
  sentiment_score: number;
  engagement_rate_score: number;
  reach_score: number;
  mentions_velocity_score: number;
  engagement_volume_score: number;
  brand_health_score: number;
  components_calculated: number;
  calculation_metadata: any;
  created_at: string;
}

export interface InsightData {
  brand_id: string;
  tenant_id: string;
  category: 'Awareness' | 'Consideration' | 'Trust & Credibility';
  insight_title: string;
  insight_text: string;
  metric_value: number;
  insight_status: 'Good' | 'Needs Attention' | 'Critical';
  yoy_change_percent: number;
  display_order: number;
}

export interface AIInsight {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id: number;
  okr_objective_id?: string;
  name: string;
  date: string;
  insight_type: string;
  insight_category: string;
  insight_title: string;
  insight_description: string;
  platform?: string;
  confidence_score: number;
  impact_score: number;
  priority_display: 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  confidence_display: string;
  trend_indicator: string;
  recommended_actions: string[];
  data_points: any;
  action_count: number;
  top_action: string;
  stage: string;
  stage_display?: string;
  viewed_at?: string;
  viewed_by?: string;
  viewed_by_email?: string;
  saved_at?: string;
  saved_by?: string;
  saved_by_email?: string;
  actioned_at?: string;
  actioned_by?: string;
  actioned_by_email?: string;
  created_at: string;
  expires_at?: string;
  days_old: number;
  age_group: string;
  expiry_status: 'No Expiry' | 'Active' | 'Expired';
  days_until_expiry?: number;
  composite_score: number;
  action_status: 'Completed' | 'Selected for Action' | 'In Progress' | 'Saved' | 'Viewed' | 'Unread';
  is_active: boolean;
  requires_immediate_action: boolean;
}

// Component Props Interfaces
export interface BrandScoreCardProps {
  score: number;
  isLoading?: boolean;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface InsightCardProps {
  category: 'Awareness' | 'Consideration' | 'Trust & Credibility';
  insights: InsightData[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

export interface AIActionCardProps {
  insight: AIInsight;
  onStatusChange?: (id: string, status: AIInsight['action_status']) => void;
}

// Store Interfaces
export interface BrandHealthFilters {
  priority: string[];
  status: string[];
}

export interface BrandHealthStore {
  selectedBrand: string | null;
  activeCategory: 'Awareness' | 'Consideration' | 'Trust & Credibility' | 'AI Actions';
  filters: BrandHealthFilters;
  lastRefreshed?: Date;
  
  // Actions
  setSelectedBrand: (brandId: string) => void;
  setActiveCategory: (category: BrandHealthStore['activeCategory']) => void;
  updateFilters: (filters: Partial<BrandHealthFilters>) => void;
  setLastRefreshed: (date: Date) => void;
}

// API Response Types
export interface BrandHealthScoreResponse {
  brand_health_score: number;
  calculation_date: string;
}

export interface InsightsByCategory {
  [key: string]: InsightData[];
}

// Validation Schemas (for use with Zod)
export interface InsightValidation {
  title: string;
  description: string;
  confidenceScore: number;
  impactScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_actions: string[];
}

// Utility Types
export type InsightStatus = 'Good' | 'Needs Attention' | 'Critical' | 'Declining' | 'At Risk';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionStatus = 'new' | 'viewed' | 'in-progress' | 'completed';
export type CategoryType = 'Awareness' | 'Consideration' | 'Trust & Credibility';

// Score color mapping
export interface ScoreColors {
  ring: string;
  background: string;
  text: string;
}

export const getScoreColor = (score: number): ScoreColors => {
  if (score >= 80) {
    return {
      ring: 'stroke-green-500',
      background: 'from-green-600 to-green-800',
      text: 'text-green-100'
    };
  } else if (score >= 50) {
    return {
      ring: 'stroke-yellow-500',
      background: 'from-yellow-600 to-yellow-800',
      text: 'text-yellow-100'
    };
  } else {
    return {
      ring: 'stroke-red-500',
      background: 'from-red-600 to-red-800',
      text: 'text-red-100'
    };
  }
};

// Category theme mapping
export interface CategoryTheme {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const getCategoryTheme = (category: CategoryType): CategoryTheme => {
  switch (category) {
    case 'Awareness':
      return {
        color: '#2563EB',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: 'Search'
      };
    case 'Consideration':
      return {
        color: '#059669',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: 'ThumbsUp'
      };
    case 'Trust & Credibility':
      return {
        color: '#7C3AED',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: 'Shield'
      };
  }
};