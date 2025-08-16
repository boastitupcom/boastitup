import { createClient } from '@boastitup/supabase/server';
import { MetricCardGrid } from '@boastitup/ui';
import { AIInsightsPanel } from '@boastitup/ui';
import { DashboardHeader } from '@boastitup/ui';
import { DashboardMetric, AIInsight } from '../../types/okr';

export default async function OKRDashboardPage() {
  const supabase = await createClient();
  
  // Fetch initial data server-side
  const [metricsResponse, insightsResponse] = await Promise.all([
    supabase.from('v_dashboard_metric_cards_complete').select('*'),
    supabase.from('v_ai_insights_enriched').select('*')
  ]);

  // Extract data and errors
  const metricsData = metricsResponse.data as DashboardMetric[] | null;
  const insightsData = insightsResponse.data as AIInsight[] | null;
  const metricsError = metricsResponse.error ? new Error(metricsResponse.error.message) : null;
  const insightsError = insightsResponse.error ? new Error(insightsResponse.error.message) : null;

  // Get the most recent update timestamp from metrics
  const lastUpdated = metricsData?.length > 0 
    ? metricsData.reduce((latest, metric) => {
        const metricDate = new Date(metric.last_update_date);
        const latestDate = new Date(latest);
        return metricDate > latestDate ? metric.last_update_date : latest;
      }, metricsData[0].last_update_date)
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardHeader 
        lastUpdated={lastUpdated}
      />
      
      <MetricCardGrid 
        initialData={metricsData} 
        error={metricsError}
        className="mb-8"
      />
      
      <AIInsightsPanel 
        initialData={insightsData}
        error={insightsError}
      />
    </div>
  );
}