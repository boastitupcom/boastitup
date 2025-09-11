// packages/types/index.ts
export interface AnalyticsData {
  kpis: KPI[];
  marketPulse: MarketPulseItem[];
  growthLevers: GrowthLeverItem[];
  opportunityRadar: OpportunityRadarItem[];
  benchmarks: {
    labels: string[];
    current: number[];
    previous: number[];
  };
}

export interface KPI {
  title: string;
  value: string;
  change: string;
}

export interface MarketPulseItem {
  item: string;
  type: 'trend' | 'competitor' | 'market_shift';
  change: string;
}

export interface GrowthLeverItem {
  name: string;
  status: 'active' | 'opportunity' | 'declining';
  change: string;
}

export interface OpportunityRadarItem {
  title: string;
  score: string;
}

export interface Brand {
  id: string;
  name: string;
  tenant_id: string;
  industry_id?: string;
  primary_domain?: string;
  created_at?: string;
  updated_at?: string;
}

// Enhanced brand interface with tenant information
export interface BrandWithTenant extends Brand {
  tenant_name: string;
  tenant_slug: string;
  industry?: string;
  industry_slug?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserTenantRole {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  created_at?: string;
}

export interface UserBrandRole {
  id: string;
  user_id: string;
  tenant_id: string;
  brand_id: string;
  role: 'manager' | 'editor' | 'viewer';
  is_active: boolean;
  created_at?: string;
}

// OKR Dashboard Types
export interface OKRObjective {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'close_to_target' | 'needs_attention';
  confidence_score: number; // 1-10
  metric_type: 'revenue' | 'customers' | 'conversions' | 'engagement';
  created_at?: string;
  updated_at?: string;
}

export interface KPIDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: 'traffic' | 'conversion' | 'revenue' | 'engagement' | 'social';
  data_source: 'google_analytics' | 'facebook' | 'instagram' | 'twitter' | 'internal';
  calculation_method: string;
  unit_type: 'currency' | 'percentage' | 'count' | 'rate';
  refresh_frequency: 'real_time' | '30_seconds' | '1_minute' | '5_minutes' | 'hourly';
  is_active: boolean;
}

export interface KPIMetric {
  id: string;
  kpi_definition_id: string;
  organization_id: string;
  metric_value: number;
  previous_value: number;
  target_value: number;
  variance_percentage: number;
  status: 'above_target' | 'on_target' | 'below_target' | 'critical';
  measurement_date: string;
  created_at?: string;
}

export interface PerformanceSnapshot {
  id: string;
  organization_id: string;
  okr_id: string;
  total_revenue: number;
  total_conversions: number;
  total_traffic: number;
  conversion_rate: number;
  growth_rate: number;
  snapshot_date: string;
  snapshot_type: 'daily' | 'weekly' | 'monthly';
}

// Computed/Display Types
export interface OKRSnapshot {
  id: string;
  title: string;
  description: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  status: OKRObjective['status'];
  confidence_score: number;
  days_remaining: number;
  change_amount: number;
  change_percentage: number;
  icon: string;
  metric_type: OKRObjective['metric_type'];
  unit_type: KPIDefinition['unit_type'];
  target_date: string;
}

export interface KPIScorecard {
  id: string;
  name: string;
  display_name: string;
  category: KPIDefinition['category'];
  current_value: number;
  target_value: number;
  previous_value: number;
  progress_percentage: number;
  change_amount: number;
  icon?: 'TrendingUp' | 'Users' | 'CircleDollarSign' | 'Repeat';
  color?: 'blue' | 'violet' | 'orange' | 'green' | 'yellow' | 'pink' | 'gray';
  change_percentage: number;
  status: KPIMetric['status'];
  trend_direction: 'up' | 'down' | 'stable';
  unit_type: KPIDefinition['unit_type'];
  alert_level: 'none' | 'warning' | 'critical';
  measurement_date: string;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  segments: string[];
}

export interface ProgressCalculation {
  linear_progress: number;
  velocity_progress: number;
  projected_completion_date: string;
  risk_level: 'low' | 'medium' | 'high';
  confidence_trend: 'increasing' | 'decreasing' | 'stable';
  insights: string[];
}

// Export competitor intelligence types
export * from './src/competitor-intelligence.types';