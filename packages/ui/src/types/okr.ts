// OKR Types - Matching story.txt specifications

export interface OKRTemplate {
  id: string;
  okrMasterId: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  suggestedTargetValue: number;
  suggestedTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  applicablePlatforms: string[];
  metricTypeId: string;
  confidenceScore: number;
  reasoning?: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  display_name: string;
  category: string;
  is_active?: boolean;
  created_at?: string;
}

export interface MetricType {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  created_at?: string;
}

export interface DateDimension {
  id: number;
  date: string;
  week_start: string;
  month: number;
  quarter: number;
  year: number;
  is_business_day: boolean;
  day_of_week: number;
  month_name: string;
  quarter_name: string;
  created_at?: string;
}

export interface ManagedOKR {
  id: string;
  title: string;
  description: string;
  target_value: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  target_date_id: string;
  platform_id?: string;
  metric_type_id: string;
  master_template_id?: string;
  // Related data
  dim_date?: DateDimension;
  dim_platform?: Platform;
  dim_metric_type?: MetricType;
}

export interface CreateOKRInput {
  tenantId: string;
  brandId: string;
  objectives: Array<{
    title: string;
    description: string;
    targetValue: number;
    targetDateId: number;
    granularity: 'daily' | 'weekly' | 'monthly';
    metricTypeId: string;
    platformId?: string;
    priority?: number;
    templateId?: string;
  }>;
}

export interface OKRUpdateInput {
  id: string;
  updates: Partial<{
    title: string;
    targetValue: number;
    targetDateId: number;
    isActive: boolean;
    platformId: string;
  }>;
}

export interface BulkOKRManagementOperation {
  operation: 'archive' | 'activate' | 'deactivate';
  okrIds: string[];
  data?: Record<string, any>;
}