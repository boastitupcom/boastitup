export interface OKRMetric {
  okr_id?: string;
  id?: string;
  // NEW: Updated field names from v_okr_performance
  title: string; // was objective_name
  current_value: number | null;
  target_value: number | null; // was metric_target_value
  status: string; // was performance_status
  progress_percentage?: number;
  platform_name?: string;
  metric_unit?: string;
  health?: string;
  brand_id?: string;
  
  // OLD: Keep for backward compatibility
  objective_name?: string;
  metric_name?: string;
  metric_target_value?: number | null;
  performance_status?: string;
  okr_category?: string;
  time_progress_percent?: number;
  last_updated?: string;
  is_primary?: boolean;
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

// Database response types matching Supabase views for OKR Dashboard
export interface DashboardMetric {
  okr_id: string;
  tenant_id: string;
  brand_id: string;
  card_title: string;
  main_value: string;
  daily_change_percentage: number | null;
  daily_change_absolute: number | null;
  change_direction: 'up' | 'down' | 'stable' | null;
  icon_type: 'revenue' | 'instagram' | 'tiktok' | 'customers' | 'orders' | 'repeat_purchase';
  card_status: 'On Track' | 'At Risk' | 'Behind' | 'No Data';
  target_value: number;
  current_value: number;
  progress_percentage: number;
  platform_name: string;
  metric_description: string;
  metric_unit: string;
  last_update_date: string;
  status_color: 'green' | 'red' | 'yellow' | 'gray';
  change_color: 'green' | 'red' | 'blue' | 'gray';
}

export interface AIInsight {
  insight_title: string;
  insight_description: string;
  confidence_score: number;
  impact_score: number;
  priority_display: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  confidence_display: string;
  priority_color: 'red' | 'orange' | 'blue';
  recommended_actions: any; // Can be string, array, or other format from database
}

// Hook return types
export interface UseDashboardMetricsReturn {
  metrics: DashboardMetric[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseAIInsightsReturn {
  insights: AIInsight[] | null;
  isLoading: boolean;
  error: Error | null;
  acknowledgeInsight: (insightTitle: string) => Promise<void>;
}