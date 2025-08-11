export interface OKRMetric {
  okr_id?: string;
  id?: string;
  objective_name: string;
  metric_name: string;
  current_value: number | null;
  metric_target_value: number | null;
  performance_status: string;
  okr_category?: string;
  platform_name?: string;
  time_progress_percent?: number;
  progress_percentage?: number;
  last_updated?: string;
  is_primary?: boolean;
  brand_id?: string;
  tenant_id?: string;
}

export interface OKRTrendData {
  okr_id: string;
  date: string;
  value: number;
  metric_name: string;
  target_value?: number;
  is_primary?: boolean;
}

export interface OKRProgressSummary {
  brand_id: string;
  okr_health_score: number;
  total_okrs: number;
  completed_okrs: number;
  at_risk_okrs: number;
  behind_okrs: number;
  on_track_okrs: number;
  not_started_okrs: number;
}

export interface BrandDashboardOverview {
  brand_id: string;
  total_objectives: number;
  performance_distribution: {
    excellent: number;
    good: number;
    at_risk: number;
    not_available: number;
  };
  category_breakdown: {
    brand_awareness: number;
    engagement: number;
    growth: number;
    retention: number;
    revenue: number;
  };
}

export interface AIInsightData {
  id: string;
  brand_id: string;
  insight_type: 'recommendation' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  confidence_score: number;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  okr_objective_id?: string;
  metric_type_id?: string;
  action_items?: string[];
}