// Brand Health Dashboard Types - Matching latest.txt specifications

// Primary Types - From ai_insights_v1 schema
export interface AIInsightV1 {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id?: number;
  name: string;
  insight_type: string;
  insight_category: string;
  insight_title: string;
  insight_description: string;
  platform?: PlatformEnum;
  confidence_score?: number; // 0.0 to 1.0
  impact_score?: number; // 1 to 10
  percentage_change?: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  priority_display?: string;
  trend_change_text?: string;
  trend_direction?: number; // 1=up, 0=neutral, -1=down
  sort_order?: number;
}

// Action Types - From ai_recommended_actions_v1 schema
export type ActionStage = 
  | 'new'
  | 'viewed'
  | 'saved'
  | 'selected_for_action'
  | 'in_progress'
  | 'actioned';

export interface RecommendedActionV1 {
  id: string;
  insight_id: string;
  action_text: string;
  action_priority: 'high' | 'medium' | 'low';
  action_description?: string;
  stage: ActionStage;
  viewed_at?: string;
  viewed_by?: string;
  saved_at?: string;
  saved_by?: string;
  actioned_at?: string;
  actioned_by?: string;
  assigned_to_campaign_id?: string;
  created_at: string;
  okr_objective_id?: string;
  action_confidence_score?: number; // 0.0 to 1.0
  action_impact_score?: number; // 1 to 10
}

// Combined type for insights with their actions
export interface InsightWithActions extends AIInsightV1 {
  ai_recommended_actions_v1: RecommendedActionV1[];
}

// Brand Health Score - From v_brand_health_scores view
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

// Platform enum type
export type PlatformEnum = 
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'multi_platform';

// Category Insights for Dashboard
export interface CategoryInsights {
  category: string;
  insights: InsightWithActions[];
  totalActions: number;
  newActions: number;
  urgentActions: number;
}

// Component Props Interfaces
export interface BrandScoreCardProps {
  score: number;
  isLoading?: boolean;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface CategoryCardProps {
  category: string;
  insights: InsightWithActions[];
  isLoading?: boolean;
  onActionStageChange: (actionId: string, newStage: ActionStage) => void;
}

export interface AIActionCardProps {
  action: RecommendedActionV1;
  insightTitle: string;
  onStageChange: (actionId: string, newStage: ActionStage) => void;
  onLinkToOKR?: (actionId: string) => void;
  onAssignToCampaign?: (actionId: string) => void;
}

// Store Interfaces
export interface BrandHealthFilters {
  priority: string[];
  status: string[];
  showExpiring: boolean;
}

export interface BrandHealthStore {
  selectedBrandId: string | null;
  activeCategory: string | null;
  filters: BrandHealthFilters;
  lastRefreshed?: Date;
  isRefreshing: boolean;
  
  // Actions
  setSelectedBrand: (brandId: string) => void;
  setActiveCategory: (category: string) => void;
  updateFilters: (filters: Partial<BrandHealthFilters>) => void;
  clearFilters: () => void;
  setLastRefreshed: (date: Date) => void;
  setRefreshing: (isRefreshing: boolean) => void;
}

// Utility Types
export type Priority = 'high' | 'medium' | 'low';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type ExpirationStatus = 'active' | 'expiring' | 'expired';

// Legacy Types (for backward compatibility)
export interface InsightData {
  brand_id: string;
  tenant_id: string;
  category: string;
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

// Helper Functions & Mappings

// Score color mapping - matches specifications
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

// Dynamic Grid System - matches specifications exactly
export const getGridColumns = (categoryCount: number): string => {
  if (categoryCount <= 2) return 'grid-cols-1 md:grid-cols-2'; // 1x2 layout
  if (categoryCount <= 4) return 'grid-cols-1 md:grid-cols-2'; // 2x2 layout
  if (categoryCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 2x3 layout
  if (categoryCount <= 8) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'; // 2x4 layout
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 3x3+ layout (wraps)
};

// Priority badge colors
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Impact level mapping
export const getImpactLevel = (score?: number): ImpactLevel => {
  if (!score) return 'Low';
  if (score >= 8) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export const getImpactColor = (level: ImpactLevel): string => {
  switch (level) {
    case 'High':
      return 'text-red-600';
    case 'Medium':
      return 'text-orange-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

// Stage management
export const getStageBadgeColor = (stage: ActionStage): string => {
  switch (stage) {
    case 'new':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'viewed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'saved':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'selected_for_action':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'actioned':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStageDisplayName = (stage: ActionStage): string => {
  switch (stage) {
    case 'new':
      return 'New';
    case 'viewed':
      return 'Viewed';
    case 'saved':
      return 'Saved';
    case 'selected_for_action':
      return 'Selected';
    case 'in_progress':
      return 'In Progress';
    case 'actioned':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

// Stage transitions - matches specifications exactly
export const getValidTransitions = (currentStage: ActionStage): ActionStage[] => {
  const transitions: Record<ActionStage, ActionStage[]> = {
    'new': ['viewed', 'saved', 'selected_for_action'],
    'viewed': ['saved', 'selected_for_action'],
    'saved': ['selected_for_action'],
    'selected_for_action': ['in_progress', 'saved'],
    'in_progress': ['actioned', 'selected_for_action'],
    'actioned': [], // Terminal state
  };
  return transitions[currentStage] || [];
};

// Expiration helpers
export const getExpirationStatus = (expiresAt?: string): ExpirationStatus => {
  if (!expiresAt) return 'active';
  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring';
  return 'active';
};

export const getExpirationWarningText = (expiresAt?: string): string | null => {
  if (!expiresAt) return null;
  const status = getExpirationStatus(expiresAt);
  
  if (status === 'expired') return 'Expired';
  if (status === 'expiring') {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  }
  return null;
};

export const getExpirationColor = (status: ExpirationStatus): string => {
  switch (status) {
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'expiring':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'active':
    default:
      return 'bg-green-100 text-green-800 border-green-200';
  }
};

// Platform icon mapping
export interface PlatformIconData {
  icon: string;
  color: string;
  label: string;
}

export const getPlatformIcon = (platform?: string | PlatformEnum): PlatformIconData => {
  switch (platform?.toLowerCase()) {
    case 'instagram':
      return { icon: 'Instagram', color: '#E4405F', label: 'Instagram' };
    case 'facebook':
      return { icon: 'Facebook', color: '#1877F2', label: 'Facebook' };
    case 'twitter':
      return { icon: 'Twitter', color: '#1DA1F2', label: 'Twitter' };
    case 'linkedin':
      return { icon: 'Linkedin', color: '#0A66C2', label: 'LinkedIn' };
    case 'youtube':
      return { icon: 'Youtube', color: '#FF0000', label: 'YouTube' };
    case 'multi_platform':
      return { icon: 'Globe', color: '#6B7280', label: 'Multi-platform' };
    default:
      return { icon: 'Activity', color: '#6B7280', label: 'Unknown' };
  }
};

// Category theme mapping - dynamic based on category name
export interface CategoryTheme {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const getCategoryTheme = (category: string): CategoryTheme => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('awareness')) {
    return {
      color: '#2563EB',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: 'Search'
    };
  }
  
  if (categoryLower.includes('consideration')) {
    return {
      color: '#059669',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: 'ThumbsUp'
    };
  }
  
  if (categoryLower.includes('sentiment')) {
    return {
      color: '#DC2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: 'Heart'
    };
  }
  
  if (categoryLower.includes('trust') || categoryLower.includes('credibility')) {
    return {
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: 'Shield'
    };
  }
  
  // Default theme for any other category
  return {
    color: '#6B7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: 'BarChart3'
  };
};