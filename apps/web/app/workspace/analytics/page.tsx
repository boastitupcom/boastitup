// apps/web/app/workspace/analytics/page.tsx
import { createSupabaseServerClient } from '@boastitup/supabase/server';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default async function AnalyticsPage() {
  console.log('🚀 Analytics page server component starting...');
  
  try {
    const supabase = await createSupabaseServerClient();
    console.log('✅ Supabase client created');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 User fetch result:', { 
      userId: user?.id, 
      userEmail: user?.email, 
      userError: userError?.message 
    });

    if (userError) {
      console.error('❌ User authentication error:', userError);
      throw userError;
    }

    if (!user) {
      console.log('🚫 No authenticated user found');
      return <div>No authenticated user</div>;
    }

    // Fetch the user's active tenant and first brand
    console.log('🔍 Fetching user tenant roles...');
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenant_roles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    console.log('🏢 Tenant fetch result:', { 
      userTenant, 
      tenantError: tenantError?.message 
    });

    const tenantId = userTenant?.tenant_id || null;
    let brandId = null;

    if (tenantId) {
      console.log('🔍 Fetching user brand roles for tenant:', tenantId);
      const { data: userBrand, error: brandError } = await supabase
        .from('user_brand_roles')
        .select('brand_id')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      console.log('🏷️ Brand fetch result:', { 
        userBrand, 
        brandError: brandError?.message 
      });

      brandId = userBrand?.brand_id || null;
    } else {
      console.log('⚠️ No tenant ID found, skipping brand fetch');
    }

    const finalProps = { tenantId, brandId };
    console.log('📊 Final props for AnalyticsDashboard:', finalProps);

    return <AnalyticsDashboard {...finalProps} />;
    
  } catch (error) {
    console.error('💥 Analytics page error:', error);
    console.error('📋 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Server Error</h2>
          <p className="text-red-700">
            {error instanceof Error ? error.message : 'An unknown server error occurred'}
          </p>
          <div className="mt-4 text-sm text-red-600">
            Check the server console for detailed logs.
          </div>
        </div>
      </div>
    );
  }
}