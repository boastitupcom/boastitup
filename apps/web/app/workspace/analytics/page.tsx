// apps/web/app/workspace/analytics/page.tsx
import { createSupabaseServerClient } from '@boastitup/supabase/server';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the user's active tenant and first brand
  const { data: userTenant } = await supabase
    .from('user_tenant_roles')
    .select('tenant_id')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .maybeSingle();

  const tenantId = userTenant?.tenant_id || null;
  let brandId = null;

  if (tenantId) {
    const { data: userBrand } = await supabase
      .from('user_brand_roles')
      .select('brand_id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .limit(1)
      .single();
    brandId = userBrand?.brand_id || null;
  }

  return <AnalyticsDashboard tenantId={tenantId} brandId={brandId} />;
}