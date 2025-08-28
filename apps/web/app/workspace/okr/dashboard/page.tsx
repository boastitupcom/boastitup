import { createClient } from '@boastitup/supabase/server';
import { redirect } from 'next/navigation';
import { MetricCardGrid } from '@boastitup/ui';
import { AIInsightsPanel } from '@boastitup/ui';
import { DashboardHeader } from '@boastitup/ui';

export default async function OKRDashboardPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get user's brand context
  const { data: brandUser } = await supabase
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

  if (!brandUser) {
    redirect('/workspace');
  }

  // Fetch OKR data from okr_objectives table according to story.txt
  const { data: okrData, error: okrError } = await supabase
    .from('okr_objectives')
    .select(`
      id,
      title,
      description,
      target_value,
      target_date_id,
      granularity,
      is_active,
      created_at,
      updated_at,
      master_template_id,
      dim_metric_type!inner(
        id,
        code,
        description,
        unit,
        category
      )
    `)
    .eq('brand_id', brandUser.brand_id)
    .eq('tenant_id', brandUser.brands.tenant_id)
    .eq('is_active', true);

  // MetricCardGrid will use the hook to fetch data with proper formatting
  // No need to transform data here since the hook handles it

  // Simple AI insights based on OKR data
  const insightsData = [
    {
      id: 'insight-1',
      type: 'performance' as const,
      title: 'OKR Performance Overview',
      description: `You have ${okrData?.length || 0} active OKRs. Focus on high-priority objectives to maximize impact.`,
      confidence: 0.8,
      priority: 'medium' as const,
      created_at: new Date().toISOString()
    }
  ];

  const lastUpdated = okrData?.length > 0 
    ? okrData.reduce((latest, okr) => {
        const okrDate = new Date(okr.updated_at);
        const latestDate = new Date(latest);
        return okrDate > latestDate ? okr.updated_at : latest;
      }, okrData[0].updated_at)
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardHeader 
        lastUpdated={lastUpdated}
      />
      
      <MetricCardGrid 
        initialData={null} 
        error={okrError ? new Error(okrError.message) : null}
        className="mb-8"
      />
      
      <AIInsightsPanel 
        initialData={insightsData}
        error={null}
      />
    </div>
  );
}