import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { DashboardMetric, UseDashboardMetricsReturn } from '../types/okr';

// Helper functions for dashboard metric formatting
function formatMainValue(value: number, unit: string): string {
  if (unit === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === 'percentage') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

function getIconType(metricCode: string): 'revenue' | 'instagram' | 'tiktok' | 'customers' | 'orders' | 'repeat_purchase' {
  const iconMap = {
    'monthly_revenue': 'revenue',
    'customer_acquisition': 'customers',
    'average_order_value': 'orders',
    'repeat_purchase_rate': 'repeat_purchase'
  };
  return iconMap[metricCode] || 'revenue';
}

function getCardStatus(progressPercentage: number): 'On Track' | 'At Risk' | 'Behind' | 'No Data' {
  if (progressPercentage >= 80) return 'On Track';
  if (progressPercentage >= 60) return 'At Risk';
  if (progressPercentage > 0) return 'Behind';
  return 'No Data';
}

function getStatusColor(progressPercentage: number): 'green' | 'red' | 'yellow' | 'gray' {
  if (progressPercentage >= 80) return 'green';
  if (progressPercentage >= 60) return 'yellow';
  if (progressPercentage > 0) return 'red';
  return 'gray';
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetric[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user authentication and brand context first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Get user's brand context
      const { data: brandUser, error: brandError } = await supabase
        .from('user_brand_roles')
        .select(`
          brand_id,
          brands!inner(
            id,
            name,
            tenant_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (brandError || !brandUser) {
        throw new Error('Brand context not found');
      }

      // Fetch dashboard data directly from v_okr_dashboard_complete view as defined in old.txt
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('v_okr_dashboard_complete')
        .select('*')
        .eq('tenant_id', brandUser.brands.tenant_id);

      if (dashboardError) {
        throw new Error(dashboardError.message);
      }

      // Transform dashboard data to DashboardMetric format using real database fields
      const transformedMetrics = (dashboardData || []).map(item => {
        const progressPercentage = item.progress_percentage || 0;
        
        return {
          okr_id: item.id,
          tenant_id: item.tenant_id,
          brand_id: brandUser.brand_id,
          card_title: item.title,
          main_value: item.display_value,
          daily_change_percentage: item.daily_change_percentage,
          daily_change_absolute: item.daily_change_absolute,
          change_direction: item.change_direction,
          icon_type: item.metric_category_icon as 'revenue' | 'instagram' | 'tiktok' | 'customers' | 'orders' | 'repeat_purchase',
          card_status: item.status as 'On Track' | 'At Risk' | 'Behind' | 'No Data',
          target_value: item.target_value,
          current_value: item.current_value,
          progress_percentage: progressPercentage,
          platform_name: item.platform_name,
          metric_description: item.metric_description,
          metric_unit: item.metric_unit,
          last_update_date: new Date().toISOString(),
          status_color: getStatusColor(progressPercentage),
          change_color: item.change_direction === 'up' ? 'green' : item.change_direction === 'down' ? 'red' : 'blue'
        } as DashboardMetric;
      });

      setMetrics(transformedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const refresh = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
}