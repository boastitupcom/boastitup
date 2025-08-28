import { createClient } from '@boastitup/supabase/server';
import { redirect } from 'next/navigation';
import { OKRCreationView } from '../../../../views/okr/OKRCreationView';
import { OKRErrorBoundary } from '../../../../components/okr/ErrorBoundary';
import { Industry, Platform, MetricType, DateDimension } from '../../../../types/okr-creation';

export default async function OKRCreatePage() {
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

  try {
    // Fetch all required dimensions in parallel
    const [
      industriesResult,
      platformsResult, 
      metricTypesResult,
      datesResult
    ] = await Promise.all([
      // Industries
      supabase
        .from('industries')
        .select('id, name, slug, description')
        .order('name'),
      
      // Platforms
      supabase
        .from('dim_platform')
        .select('id, name, display_name, category, is_active')
        .eq('is_active', true)
        .order('display_name'),
      
      // Metric Types
      supabase
        .from('dim_metric_type')
        .select('id, code, description, category, unit')
        .order('description'),
      
      // Date dimensions (next 3 months of business days)
      supabase
        .from('dim_date')
        .select('id, date, year, month, month_name, quarter_name, is_business_day')
        .eq('is_business_day', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .limit(90)
    ]);

    // Handle any errors
    if (industriesResult.error) {
      console.error('Error fetching industries:', industriesResult.error);
    }
    if (platformsResult.error) {
      console.error('Error fetching platforms:', platformsResult.error);
    }
    if (metricTypesResult.error) {
      console.error('Error fetching metric types:', metricTypesResult.error);
    }
    if (datesResult.error) {
      console.error('Error fetching dates:', datesResult.error);
    }

    // Transform the data to match our interfaces
    const industries: Industry[] = (industriesResult.data || []).map(industry => ({
      id: industry.id,
      name: industry.name,
      slug: industry.slug,
      description: industry.description || ''
    }));

    const platforms: Platform[] = (platformsResult.data || []).map(platform => ({
      id: platform.id,
      name: platform.name,
      display_name: platform.display_name,
      category: platform.category
    }));

    const metricTypes: MetricType[] = (metricTypesResult.data || []).map(metricType => ({
      id: metricType.id,
      name: metricType.code,
      display_name: metricType.description,
      category: metricType.category,
      unit: metricType.unit
    }));

    const dates: DateDimension[] = (datesResult.data || []).map(date => ({
      id: date.id,
      date: date.date,
      year: date.year,
      month: date.month,
      month_name: date.month_name,
      quarter_name: date.quarter_name
    }));

    return (
      <OKRErrorBoundary>
        <OKRCreationView
          initialIndustries={industries}
          initialPlatforms={platforms}
          initialMetricTypes={metricTypes}
          initialDates={dates}
          brandId={brandId}
        />
      </OKRErrorBoundary>
    );

  } catch (error) {
    console.error('Error fetching initial data for OKR creation:', error);
    
    // Fallback: render with empty initial data - hooks will handle the loading
    return (
      <OKRErrorBoundary>
        <OKRCreationView
          initialIndustries={[]}
          initialPlatforms={[]}
          initialMetricTypes={[]}
          initialDates={[]}
          brandId={brandId}
        />
      </OKRErrorBoundary>
    );
  }
}