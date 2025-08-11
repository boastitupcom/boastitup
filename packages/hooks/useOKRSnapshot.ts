// packages/hooks/useOKRSnapshot.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import type { OKRSnapshot } from '@boastitup/types';

interface UseOKRSnapshotOptions {
  brandId?: string;
  tenantId?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface UseOKRSnapshotReturn {
  okrData: OKRSnapshot[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useOKRSnapshot(options: UseOKRSnapshotOptions = {}): UseOKRSnapshotReturn {
  const { brandId, tenantId, refreshInterval = 30000, autoRefresh = true } = options;
  
  const [okrData, setOkrData] = useState<OKRSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const supabase = createClient();

  const fetchOKRData = useCallback(async () => {
    try {
      setError(null);
      
      if (!brandId || !tenantId) {
        console.warn('Brand ID and Tenant ID are required for OKR data fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching OKR data for brand:', brandId, 'tenant:', tenantId);

      // Query the mv_okr_performance materialized view with brand and tenant context
      const { data, error: queryError } = await supabase
        .from('mv_okr_performance')
        .select(`
          objective_id,
          tenant_id,
          brand_id,
          title,
          description,
          target_value,
          target_date,
          metric_code,
          metric_description,
          metric_unit,
          current_value,
          progress_percentage,
          variance,
          days_remaining,
          status,
          confidence_score,
          last_metric_date,
          created_at
        `)
        .eq('brand_id', brandId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      // Transform data from mv_okr_performance to OKRSnapshot format
      const transformedData: OKRSnapshot[] = (data || []).map(item => ({
        id: item.objective_id,
        title: item.title || getMetricTitle(item.metric_code),
        description: item.description || getMetricDescription(item.metric_code),
        current_value: item.current_value,
        target_value: item.target_value,
        progress_percentage: item.progress_percentage,
        status: item.status as any, // Use the calculated status from the view
        confidence_score: item.confidence_score,
        days_remaining: item.days_remaining,
        change_amount: item.variance, // Using variance as change amount
        change_percentage: calculateChangePercentage(item.current_value, item.variance),
        icon: getIconForMetricCode(item.metric_code),
        metric_type: getMetricTypeFromCode(item.metric_code),
        unit_type: item.metric_unit as any || getUnitTypeFromCode(item.metric_code),
        target_date: item.target_date,
      }));

      setOkrData(transformedData);
      setLastUpdated(new Date());
      
      console.log('OKR data fetched successfully:', transformedData.length, 'items');
      
    } catch (err) {
      console.error('Error fetching OKR data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch OKR data');
    } finally {
      setLoading(false);
    }
  }, [brandId, tenantId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchOKRData();
  }, [fetchOKRData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(fetchOKRData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOKRData, autoRefresh, refreshInterval]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchOKRData();
  }, [fetchOKRData]);

  return {
    okrData,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}

// Helper functions for data transformation
function getMetricTitle(metricCode: string): string {
  const titleMap: Record<string, string> = {
    'monthly_revenue': 'Monthly Revenue Target',
    'customer_acquisition': 'New Customer Acquisition',
    'average_order_value': 'Average Order Value',
    'repeat_purchase_rate': 'Repeat Purchase Rate',
    'conversion_rate': 'Conversion Rate',
    'customer_retention': 'Customer Retention Rate',
  };
  
  return titleMap[metricCode] || metricCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getMetricDescription(metricCode: string): string {
  const descMap: Record<string, string> = {
    'monthly_revenue': 'Increase monthly recurring revenue through improved conversion rates and customer acquisition',
    'customer_acquisition': 'Acquire new customers through targeted marketing campaigns and referral programs',
    'average_order_value': 'Increase average order value through upselling and cross-selling strategies',
    'repeat_purchase_rate': 'Improve customer retention and encourage repeat purchases',
    'conversion_rate': 'Optimize conversion funnel to increase purchase conversions',
    'customer_retention': 'Retain existing customers and reduce churn rate',
  };
  
  return descMap[metricCode] || `Track and optimize ${metricCode.replace(/_/g, ' ')} performance`;
}

function getIconForMetricCode(metricCode: string): string {
  const iconMap: Record<string, string> = {
    'monthly_revenue': 'DollarSign',       // 💰 Money symbol
    'customer_acquisition': 'UserPlus',    // 👥+ Person being added
    'average_order_value': 'CreditCard',   // 💳 Credit card for purchases
    'repeat_purchase_rate': 'Repeat',      // 🔄 Repeat/cycle arrow
    'conversion_rate': 'ArrowUpCircle',    // ⬆️ Upward growth arrow
    'customer_retention': 'Users',         // 👥 Multiple users
  };
  
  return iconMap[metricCode] || 'Target';
}

function getMetricTypeFromCode(metricCode: string): 'revenue' | 'customers' | 'conversions' | 'engagement' {
  const typeMap: Record<string, 'revenue' | 'customers' | 'conversions' | 'engagement'> = {
    'monthly_revenue': 'revenue',
    'customer_acquisition': 'customers',
    'average_order_value': 'conversions',
    'repeat_purchase_rate': 'engagement',
    'conversion_rate': 'conversions',
    'customer_retention': 'customers',
  };
  
  return typeMap[metricCode] || 'conversions';
}

function getUnitTypeFromCode(metricCode: string): 'currency' | 'percentage' | 'count' | 'rate' {
  const unitMap: Record<string, 'currency' | 'percentage' | 'count' | 'rate'> = {
    'monthly_revenue': 'currency',
    'customer_acquisition': 'count',
    'average_order_value': 'currency',
    'repeat_purchase_rate': 'percentage',
    'conversion_rate': 'percentage',
    'customer_retention': 'percentage',
  };
  
  return unitMap[metricCode] || 'count';
}


function calculateChangePercentage(currentValue: number, changeValue: number): number {
  const previousValue = currentValue - changeValue;
  if (previousValue === 0) return 0;
  return (changeValue / previousValue) * 100;
}