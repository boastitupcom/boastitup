// packages/hooks/src/use-analytics.ts
import { useState, useEffect } from 'react';
import { AnalyticsData } from '@boastitup/types';
import { SupabaseClient } from '@supabase/supabase-js';

// This hook now requires the Supabase client and IDs to fetch data
export const useAnalyticsData = (
    supabase: SupabaseClient,
    tenantId: string | null,
    brandId: string | null
) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId || !brandId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch real data from Supabase
        const { data: metrics, error: metricsError } = await supabase
          .from('growth_metrics')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('brand_id', brandId)
          .order('metric_date', { ascending: false })
          .limit(1)
          .single();

        if (metricsError) throw metricsError;

        // Map the fetched data to our AnalyticsData structure
        const formattedData: AnalyticsData = {
          kpis: [
            { title: 'Social Engagement', value: metrics.social_engagement.toLocaleString(), change: `${metrics.social_engagement_change_pct}%` },
            { title: 'Conversion Rate', value: `${metrics.conversion_rate}%`, change: `${metrics.conversion_rate_change_pct}%` },
            { title: 'Ad Spend ROI', value: `${metrics.ad_spend_roi}x`, change: `${metrics.ad_spend_roi_change_pct}%` },
            { title: 'Growth Efficiency Score', value: metrics.growth_efficiency_score.toString(), change: `${metrics.growth_efficiency_change_pct}%` }
          ],
          // Dummy data for other sections until their tables are queried
          marketPulse: [],
          growthLevers: [],
          opportunityRadar: [],
          benchmarks: {
            labels: ['Organic Traffic', 'Conversion Rate', 'Retention', 'Social Engagement'],
            current: [metrics.organic_traffic_growth_pct, metrics.conversion_rate, metrics.customer_retention_pct, metrics.social_engagement],
            previous: [12, 2.5, 58, 2.7] // Dummy previous data
          }
        };
        
        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, tenantId, brandId]);

  return { data, isLoading, error };
};