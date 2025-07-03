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
      console.log('🔍 Starting analytics data fetch with:', { tenantId, brandId });
      
      if (!tenantId || !brandId) {
        console.log('❌ Missing required IDs:', { tenantId, brandId });
        setIsLoading(false);
        setError(new Error(`Missing required data: tenantId=${tenantId}, brandId=${brandId}`));
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('📊 Fetching growth metrics from Supabase...');
        
        // First, let's check if the table exists and has any data
        const { data: tableCheck, error: tableError } = await supabase
          .from('growth_metrics')
          .select('count')
          .limit(1);
          
        console.log('📋 Table check result:', { tableCheck, tableError });
        
        if (tableError) {
          console.error('❌ Table check failed:', tableError);
          throw new Error(`Database table error: ${tableError.message}`);
        }

        // Fetch real data from Supabase
        console.log('🔎 Querying growth_metrics with filters:', { tenant_id: tenantId, brand_id: brandId });
        
        const { data: metrics, error: metricsError } = await supabase
          .from('growth_metrics')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('brand_id', brandId)
          .order('metric_date', { ascending: false })
          .limit(1);

        console.log('📈 Metrics query result:', { 
          metrics, 
          metricsError,
          dataLength: metrics?.length,
          firstRecord: metrics?.[0] 
        });

        if (metricsError) {
          console.error('❌ Metrics query failed:', metricsError);
          throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
        }

        if (!metrics || metrics.length === 0) {
          console.log('📭 No metrics data found, creating dummy data');
          
          // Create dummy data when no real data exists
          const dummyData: AnalyticsData = {
            kpis: [
              { title: 'Social Engagement', value: '12.5K', change: '+15.2%' },
              { title: 'Conversion Rate', value: '3.2%', change: '+8.1%' },
              { title: 'Ad Spend ROI', value: '4.2x', change: '+12.5%' },
              { title: 'Growth Efficiency Score', value: '87', change: '+5.3%' }
            ],
            marketPulse: [
              { item: 'Protein Supplements', type: 'trend', change: '+23%' },
              { item: 'Competitor X Launch', type: 'competitor', change: 'New' },
              { item: 'Health Awareness Rising', type: 'market_shift', change: '+18%' }
            ],
            growthLevers: [
              { name: 'Instagram Engagement', status: 'active', change: '+25%' },
              { name: 'Influencer Partnerships', status: 'opportunity', change: '+40%' },
              { name: 'Email Marketing', status: 'active', change: '+12%' }
            ],
            opportunityRadar: [
              { title: 'Video Content Gap', score: 'High Priority' },
              { title: 'SEO Optimization', score: 'Medium Priority' },
              { title: 'Mobile Experience', score: 'Low Priority' }
            ],
            benchmarks: {
              labels: ['Organic Traffic', 'Conversion Rate', 'Retention', 'Social Engagement'],
              current: [85, 3.2, 72, 12.5],
              previous: [78, 2.8, 68, 10.8]
            }
          };
          
          console.log('✅ Setting dummy data');
          setData(dummyData);
          return;
        }

        const metric = metrics[0];
        console.log('🎯 Processing metric data:', metric);

        // Map the fetched data to our AnalyticsData structure
        const formattedData: AnalyticsData = {
          kpis: [
            { 
              title: 'Social Engagement', 
              value: metric.social_engagement ? metric.social_engagement.toLocaleString() : '0', 
              change: `${metric.social_engagement_change_pct || 0}%` 
            },
            { 
              title: 'Conversion Rate', 
              value: `${metric.conversion_rate || 0}%`, 
              change: `${metric.conversion_rate_change_pct || 0}%` 
            },
            { 
              title: 'Ad Spend ROI', 
              value: `${metric.ad_spend_roi || 0}x`, 
              change: `${metric.ad_spend_roi_change_pct || 0}%` 
            },
            { 
              title: 'Growth Efficiency Score', 
              value: (metric.growth_efficiency_score || 0).toString(), 
              change: `${metric.growth_efficiency_change_pct || 0}%` 
            }
          ],
          // Dummy data for other sections until their tables are implemented
          marketPulse: [
            { item: 'Protein Supplements', type: 'trend', change: '+23%' },
            { item: 'Competitor Analysis', type: 'competitor', change: 'New' }
          ],
          growthLevers: [
            { name: 'Social Media', status: 'active', change: '+15%' },
            { name: 'Content Marketing', status: 'opportunity', change: '+25%' }
          ],
          opportunityRadar: [
            { title: 'SEO Optimization', score: 'High Priority' },
            { title: 'Mobile Experience', score: 'Medium Priority' }
          ],
          benchmarks: {
            labels: ['Organic Traffic', 'Conversion Rate', 'Retention', 'Social Engagement'],
            current: [
              metric.organic_traffic_growth_pct || 0, 
              metric.conversion_rate || 0, 
              metric.customer_retention_pct || 0, 
              metric.social_engagement || 0
            ],
            previous: [12, 2.5, 58, 2.7] // Dummy previous data
          }
        };
        
        console.log('✅ Successfully formatted data:', formattedData);
        setData(formattedData);
        
      } catch (err) {
        console.error('💥 Error in fetchData:', err);
        console.error('📋 Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace',
          name: err instanceof Error ? err.name : 'Unknown'
        });
        
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
        console.log('🏁 Analytics data fetch completed');
      }
    };

    fetchData();
  }, [supabase, tenantId, brandId]);

  return { data, isLoading, error };
};