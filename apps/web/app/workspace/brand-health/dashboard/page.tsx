import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@boastitup/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BrandHealthDashboard from '../../../../views/brand-health/BrandHealthDashboard';
import { Skeleton, Card, CardContent, CardHeader } from '@boastitup/ui';

export const metadata: Metadata = {
  title: 'Brand Health Dashboard | BoastItUp',
  description: 'Real-time insights into your brand\'s performance across all digital platforms',
};

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel Skeleton */}
        <div className="lg:col-span-1">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Skeleton className="h-40 w-40 rounded-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel Skeleton */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-lg" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start justify-between p-3 border-b border-gray-100">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 ml-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server component to get user data and brand context
async function BrandHealthDashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect('/auth/login');
  }

  // Get user's brand associations
  const { data: brandRoles, error: brandError } = await supabase
    .from('user_brand_roles')
    .select(`
      brand_id,
      tenant_id,
      role,
      brands!inner (
        id,
        name,
        tenant_id,
        is_active
      )
    `)
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .eq('brands.is_active', true);

  if (brandError || !brandRoles || brandRoles.length === 0) {
    redirect('/workspace/setup');
  }

  // For now, use the first brand the user has access to
  // In the future, this could be determined by URL params or user preference
  const selectedBrandRole = brandRoles[0];
  const brandId = selectedBrandRole.brand_id;
  const tenantId = selectedBrandRole.tenant_id;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BrandHealthDashboard 
        brandId={brandId} 
        tenantId={tenantId}
        userId={session.user.id}
      />
    </Suspense>
  );
}

export default BrandHealthDashboardPage;