import { createClient } from '@boastitup/supabase/server';
import { redirect } from 'next/navigation';
import { OKRManagementView } from '../../../../views/okr/OKRManagementView';

export default async function OKRManagePage() {
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
        tenant_id,
        industries(
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!brandUser) {
    redirect('/workspace');
  }

  const brandId = brandUser.brand_id;
  const tenantId = brandUser.brands.tenant_id;

  try {
    // Fetch user's OKRs with related data
    const { data: okrs, error } = await supabase
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
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching OKRs:', error);
      // Fallback to empty data
    }

    // Also fetch summary stats
    const { data: stats } = await supabase
      .from('okr_objectives')
      .select('is_active')
      .eq('brand_id', brandId);

    // Calculate summary statistics
    const totalOKRs = stats?.length || 0;
    const activeOKRs = stats?.filter(s => s.is_active === true).length || 0;
    const inactiveOKRs = stats?.filter(s => s.is_active === false).length || 0;

    const summaryStats = {
      total: totalOKRs,
      active: activeOKRs,
      inactive: inactiveOKRs
    };

    return (
      <OKRManagementView
        initialOKRs={okrs || []}
        summaryStats={summaryStats}
        brandId={brandId}
        tenantId={tenantId}
      />
    );

  } catch (error) {
    console.error('Error in OKR management page:', error);
    
    // Fallback: render with empty data
    return (
      <OKRManagementView
        initialOKRs={[]}
        summaryStats={{ total: 0, active: 0, inactive: 0 }}
        brandId={brandId}
        tenantId={tenantId}
      />
    );
  }
}