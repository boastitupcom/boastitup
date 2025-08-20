import { createClient } from '@boastitup/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { OKREditView } from '../../../../../views/okr/OKREditView';
import { ManagedOKR } from '../../../../../types/okr-creation';

interface OKREditPageProps {
  params: {
    id: string;
  };
}

export default async function OKREditPage({ params }: OKREditPageProps) {
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
      role,
      brands!inner(
        id,
        name,
        industry_id,
        tenant_id
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!brandUser) {
    redirect('/workspace');
  }

  const brandId = brandUser.brand_id;

  try {
    // Fetch the specific OKR with all related data
    const { data: okr, error } = await supabase
      .from('okr_objectives')
      .select(`
        id,
        title,
        description,
        target_value,
        granularity,
        is_active,
        created_at,
        updated_at,
        target_date_id,
        platform_id,
        metric_type_id,
        master_template_id,
        dim_date!okr_objectives_target_date_id_fkey(
          id,
          date,
          month_name,
          year,
          quarter_name
        ),
        dim_platform(
          id,
          name,
          display_name,
          category
        ),
        dim_metric_type(
          id,
          code,
          description,
          category,
          unit
        )
      `)
      .eq('id', params.id)
      .eq('brand_id', brandId)
      .single();

    if (error || !okr) {
      notFound();
    }

    // Fetch available platforms and metric types for the form
    const [platformsResult, metricTypesResult, datesResult] = await Promise.all([
      supabase
        .from('dim_platform')
        .select('id, name, display_name, category')
        .eq('is_active', true)
        .order('display_name'),
      
      supabase
        .from('dim_metric_type')
        .select('id, name, display_name, category, unit')
        .eq('is_active', true)
        .order('display_name'),
      
      supabase
        .from('dim_date')
        .select('id, date, year, month, month_name, quarter_name, is_business_day')
        .eq('is_business_day', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .limit(90)
    ]);

    return (
      <OKREditView
        okr={okr as ManagedOKR}
        platforms={platformsResult.data || []}
        metricTypes={metricTypesResult.data || []}
        dates={datesResult.data || []}
        brandId={brandId}
      />
    );

  } catch (error) {
    console.error('Error fetching OKR for editing:', error);
    notFound();
  }
}