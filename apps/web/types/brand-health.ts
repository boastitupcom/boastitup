// Brand Health Dashboard Types
// Based on ai_insights_v1 and ai_recommended_actions_v1 tables

export type ActionStage = 
  | 'new'                 
  | 'viewed'              
  | 'saved'               
  | 'selected_for_action' 
  | 'in_progress'         
  | 'actioned'            
  | 'dismissed';

export type ActionPriority = 'high' | 'medium' | 'low';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type PriorityDisplay = 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';

// Brand Health Score from v_brand_health_scores - matches actual database structure
export interface BrandHealthScore {
  brand_id: string;
  tenant_id: string;
  date_id?: number;
  brand_name?: string;
  mentions?: number;
  total_reach?: number;
  total_engagements?: number;
  engagement_rate?: number;
  sentiment_score: number;
  normalized_sentiment_score?: number;
  normalized_engagement_rate_score?: number;
  normalized_reach_score?: number;
  normalized_mentions_velocity_score?: number;
  normalized_engagement_volume_score?: number;
  brand_health_score: number; // This will be normalized to 0-100 by the service
  adjusted_brand_health_score?: number;
  ai_insight_impact_score?: number;
  lookback_days?: number;
  crisis_threshold_multiplier?: number;
  min_mentions_for_sentiment?: number;
  config_is_active?: boolean;
  config_updated_at?: string;
  insight_title?: string;
  insight_description?: string;
  // Additional computed fields for UI
  engagement_rate_score?: number;
  reach_score?: number;
  mentions_velocity_score?: number;
  engagement_volume_score?: number;
}

// Core insight from ai_insights_v1 table
export interface InsightV1 {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id?: number;
  name: string;
  insight_type: string;
  insight_category: string;
  insight_title: string;
  insight_description: string;
  platform?: string;
  confidence_score?: number;
  impact_score?: number;
  percentage_change?: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  priority_display?: string;
  trend_change_text?: string;
  trend_direction?: number;
  sort_order?: number;
}

// Action from ai_recommended_actions_v1 table
export interface RecommendedActionV1 {
  id: string;
  insight_id: string;
  action_text: string;
  action_priority: string;
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
  action_confidence_score?: number;
  action_impact_score?: number;
}

// Combined insight with actions for dashboard
export interface InsightWithActions {
  id: string;
  tenant_id: string;
  brand_id: string;
  date_id?: number;
  name: string;
  insight_type: string;
  insight_category: string;
  insight_title: string;
  insight_description: string;
  platform?: string;
  confidence_score?: number;
  impact_score?: number;
  percentage_change?: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  priority_display?: string;
  trend_change_text?: string;
  trend_direction?: number;
  sort_order?: number;
  ai_recommended_actions_v1: RecommendedActionV1[];
}

// Category-grouped insights for dashboard
export interface CategoryInsights {
  category: string;
  insights: InsightWithActions[];
  totalActions: number;
  newActions: number;
  urgentActions: number;
}

// Legacy interface for backward compatibility
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

// Legacy interface for backward compatibility
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
  priority_display: PriorityDisplay;
  confidence_display: string;
  trend_indicator: string;
  recommended_actions: { action: string; priority?: string; description?: string }[];
  data_points: any;
  action_count: number;
  top_action: { action: string; priority?: string; description?: string } | string;
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
  previousScore?: number;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
}

export interface CategoryCardProps {
  category: string;
  insights: InsightWithActions[];
  isLoading?: boolean;
  onActionStageChange: (actionId: string, newStage: ActionStage) => void;
}

export interface InsightItemProps {
  insight: InsightWithActions;
  onActionStageChange: (actionId: string, newStage: ActionStage) => void;
}

export interface AIActionCardProps {
  action: RecommendedActionV1;
  insightTitle: string;
  onStageChange: (actionId: string, newStage: ActionStage) => void;
  onLinkToOKR?: (actionId: string) => void;
  onAssignToCampaign?: (actionId: string) => void;
}

export interface ActionContextMenuProps {
  actionId: string;
  currentStage: ActionStage;
  isAssignedToOKR: boolean;
  isAssignedToCampaign: boolean;
  onStageChange: (stage: ActionStage) => void;
  onLinkToOKR: () => void;
  onAssignToCampaign: () => void;
  onRemoveAssignments: () => void;
}

// Legacy interface for backward compatibility
export interface InsightCardProps {
  category: 'Awareness' | 'Consideration' | 'Trust & Credibility';
  insights: InsightData[];
  isExpanded?: boolean;
  isLoading?: boolean;
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
  setLastRefreshed: (date: Date) => void;
  setRefreshing: (refreshing: boolean) => void;
  clearFilters: () => void;
  togglePriorityFilter: (priority: string) => void;
  toggleStatusFilter: (status: string) => void;
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

export const getCategoryTheme = (category: string): CategoryTheme => {
  const themes: Record<string, CategoryTheme> = {
    'Awareness': {
      color: '#2563EB',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: 'Search'
    },
    'Consideration': {
      color: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: 'ThumbsUp'
    },
    'Trust & Credibility': {
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: 'Shield'
    },
    'Sentiment Analysis': {
      color: '#D97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: 'BarChart3'
    }
  };

  return themes[category] || {
    color: '#6B7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: 'Activity'
  };
};

// Platform icon mapping
export interface PlatformIcon {
  icon: string;
  color: string;
  label: string;
}

export const getPlatformIcon = (platform?: string): PlatformIcon => {
  const platforms: Record<string, PlatformIcon> = {
    'instagram': {
      icon: 'Instagram',
      color: '#E4405F',
      label: 'Instagram'
    },
    'facebook': {
      icon: 'Facebook',
      color: '#1877F2',
      label: 'Facebook'  
    },
    'twitter': {
      icon: 'Twitter',
      color: '#1DA1F2',
      label: 'Twitter'
    },
    'x': {
      icon: 'Twitter',
      color: '#000000',
      label: 'X (Twitter)'
    },
    'linkedin': {
      icon: 'Linkedin',
      color: '#0A66C2',
      label: 'LinkedIn'
    },
    'youtube': {
      icon: 'Youtube',
      color: '#FF0000',
      label: 'YouTube'
    },
    'tiktok': {
      icon: 'Music',
      color: '#000000',
      label: 'TikTok'
    },
    'google': {
      icon: 'Search',
      color: '#4285F4',
      label: 'Google'
    },
    'email': {
      icon: 'Mail',
      color: '#EA4335',
      label: 'Email'
    },
    'web': {
      icon: 'Globe',
      color: '#6B7280',
      label: 'Website'
    },
    'website': {
      icon: 'Globe',
      color: '#6B7280',
      label: 'Website'
    },
    'pinterest': {
      icon: 'Pin',
      color: '#E60023',
      label: 'Pinterest'
    },
    'snapchat': {
      icon: 'Zap',
      color: '#FFFC00',
      label: 'Snapchat'
    }
  };

  return platforms[platform?.toLowerCase() || ''] || {
    icon: 'Activity',
    color: '#6B7280',
    label: platform || 'Unknown'
  };
};

// Utility Functions
export const getImpactLevel = (impactScore?: number): ImpactLevel => {
  if (!impactScore) return 'Low';
  if (impactScore >= 8) return 'High';
  if (impactScore >= 5) return 'Medium';
  return 'Low';
};

export const getImpactColor = (level: ImpactLevel): string => {
  switch (level) {
    case 'High': return 'text-red-600';
    case 'Medium': return 'text-orange-600';
    case 'Low': return 'text-green-600';
  }
};

export const getPriorityBadgeColor = (priority: string): string => {
  switch (priority.toUpperCase()) {
    case 'CRITICAL PRIORITY': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH PRIORITY': return 'bg-red-100 text-red-800 border-red-200';
    case 'MEDIUM PRIORITY': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'LOW PRIORITY': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStageBadgeColor = (stage: ActionStage): string => {
  switch (stage) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'viewed': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'saved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'selected_for_action': return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'actioned': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'dismissed': return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

export const getStageDisplayName = (stage: ActionStage): string => {
  switch (stage) {
    case 'new': return 'New';
    case 'viewed': return 'Viewed';
    case 'saved': return 'Saved';
    case 'selected_for_action': return 'Selected for Action';
    case 'in_progress': return 'In Progress';
    case 'actioned': return 'Completed';
    case 'dismissed': return 'Dismissed';
  }
};

export const getTrendIcon = (trendDirection?: number): string => {
  if (!trendDirection) return '→';
  if (trendDirection > 0) return '↑';
  if (trendDirection < 0) return '↓';
  return '→';
};

export const getTrendColor = (trendDirection?: number): string => {
  if (!trendDirection) return 'text-gray-500';
  if (trendDirection > 0) return 'text-green-600';
  if (trendDirection < 0) return 'text-red-600';
  return 'text-gray-500';
};

// Expiration utility functions
export const getDaysUntilExpiry = (expiresAt?: string): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInTime = expiry.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
  return diffInDays;
};

export const getExpirationStatus = (expiresAt?: string): 'expired' | 'expiring_soon' | 'active' | 'no_expiry' => {
  if (!expiresAt) return 'no_expiry';
  
  const daysUntilExpiry = getDaysUntilExpiry(expiresAt);
  if (daysUntilExpiry === null) return 'no_expiry';
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring_soon';
  return 'active';
};

export const getExpirationWarningText = (expiresAt?: string): string | null => {
  if (!expiresAt) return null;
  
  const daysUntilExpiry = getDaysUntilExpiry(expiresAt);
  if (daysUntilExpiry === null) return null;
  
  if (daysUntilExpiry < 0) {
    return `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? '' : 's'} ago`;
  }
  
  if (daysUntilExpiry === 0) return 'Expires today';
  if (daysUntilExpiry === 1) return 'Expires tomorrow';
  if (daysUntilExpiry <= 7) return `Expires in ${daysUntilExpiry} days`;
  
  return null; // No warning needed for longer periods
};

export const getExpirationColor = (status: ReturnType<typeof getExpirationStatus>): string => {
  switch (status) {
    case 'expired': return 'text-red-700 bg-red-100 border-red-300';
    case 'expiring_soon': return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'active': return 'text-green-700 bg-green-100 border-green-300';
    case 'no_expiry': return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

// Stage Transition Logic
export const getValidTransitions = (currentStage: ActionStage): ActionStage[] => {
  const transitions: Record<ActionStage, ActionStage[]> = {
    'new': ['viewed', 'saved', 'selected_for_action', 'dismissed'],
    'viewed': ['saved', 'selected_for_action', 'dismissed'],
    'saved': ['selected_for_action', 'dismissed'],
    'selected_for_action': ['in_progress', 'saved', 'dismissed'],
    'in_progress': ['actioned', 'selected_for_action'],
    'actioned': [],
    'dismissed': ['new']
  };
  
  return transitions[currentStage] || [];
};

// Grid Layout Helper
export const getGridColumns = (categoryCount: number): string => {
  if (categoryCount <= 2) return 'grid-cols-1 md:grid-cols-2';
  if (categoryCount <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
  if (categoryCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (categoryCount <= 8) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
};