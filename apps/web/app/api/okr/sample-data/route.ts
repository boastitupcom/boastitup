// apps/web/app/api/okr/sample-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

const SAMPLE_OKR_DATA = [
  {
    title: 'Monthly Revenue Target',
    description: 'Increase monthly recurring revenue through improved conversion rates and customer acquisition',
    target_value: 2800000,
    current_value: 2200000,
    target_date: '2025-12-31T23:59:59Z',
    status: 'on_track',
    confidence_score: 8,
    metric_type: 'revenue',
    progress_percentage: 78.6,
    days_remaining: 145,
    change_amount: 180000,
    change_percentage: 9.1,
    unit_type: 'currency',
  },
  {
    title: 'New Customer Acquisition',
    description: 'Acquire new customers through targeted marketing campaigns and referral programs',
    target_value: 8500,
    current_value: 6820,
    target_date: '2025-12-31T23:59:59Z',
    status: 'on_track',
    confidence_score: 7,
    metric_type: 'customers',
    progress_percentage: 80.2,
    days_remaining: 145,
    change_amount: 520,
    change_percentage: 8.3,
    unit_type: 'count',
  },
  {
    title: 'Average Order Value',
    description: 'Increase average order value through upselling and cross-selling strategies',
    target_value: 125,
    current_value: 119,
    target_date: '2025-12-31T23:59:59Z',
    status: 'close_to_target',
    confidence_score: 9,
    metric_type: 'conversions',
    progress_percentage: 94.8,
    days_remaining: 145,
    change_amount: 8,
    change_percentage: 7.5,
    unit_type: 'currency',
  },
  {
    title: 'Repeat Purchase Rate',
    description: 'Improve customer retention and encourage repeat purchases',
    target_value: 35,
    current_value: 28.5,
    target_date: '2025-12-31T23:59:59Z',
    status: 'needs_attention',
    confidence_score: 6,
    metric_type: 'engagement',
    progress_percentage: 81.4,
    days_remaining: 145,
    change_amount: 2.3,
    change_percentage: 8.8,
    unit_type: 'percentage',
  },
];

const SAMPLE_KPI_DATA = [
  // Traffic Metrics
  {
    name: 'monthly_sessions',
    display_name: 'Monthly Sessions',
    category: 'traffic',
    current_value: 485000,
    target_value: 520000,
    previous_value: 450000,
    progress_percentage: 93.3,
    change_amount: 35000,
    change_percentage: 7.8,
    status: 'below_target',
    trend_direction: 'up',
    unit_type: 'count',
    alert_level: 'warning',
    measurement_date: '2025-08-01T00:00:00Z',
  },
  {
    name: 'organic_traffic_share',
    display_name: 'Organic Traffic Share',
    category: 'traffic',
    current_value: 42.5,
    target_value: 45.0,
    previous_value: 40.2,
    progress_percentage: 94.4,
    change_amount: 2.3,
    change_percentage: 5.7,
    status: 'below_target',
    trend_direction: 'up',
    unit_type: 'percentage',
    alert_level: 'warning',
    measurement_date: '2025-08-01T00:00:00Z',
  },
  {
    name: 'email_traffic_share',
    display_name: 'Email Traffic Share',
    category: 'traffic',
    current_value: 18.2,
    target_value: 20.0,
    previous_value: 16.8,
    progress_percentage: 91.0,
    change_amount: 1.4,
    change_percentage: 8.3,
    status: 'on_target',
    trend_direction: 'up',
    unit_type: 'percentage',
    alert_level: 'none',
    measurement_date: '2025-08-01T00:00:00Z',
  },
  // Conversion Metrics
  {
    name: 'overall_conversion_rate',
    display_name: 'Overall Conversion Rate',
    category: 'conversion',
    current_value: 2.9,
    target_value: 3.2,
    previous_value: 2.7,
    progress_percentage: 89.1,
    change_amount: 0.2,
    change_percentage: 7.4,
    status: 'on_target',
    trend_direction: 'up',
    unit_type: 'percentage',
    alert_level: 'none',
    measurement_date: '2025-08-01T00:00:00Z',
  },
  {
    name: 'mobile_conversion_rate',
    display_name: 'Mobile Conversion Rate',
    category: 'conversion',
    current_value: 2.4,
    target_value: 2.8,
    previous_value: 2.2,
    progress_percentage: 86.4,
    change_amount: 0.2,
    change_percentage: 9.1,
    status: 'below_target',
    trend_direction: 'up',
    unit_type: 'percentage',
    alert_level: 'critical',
    measurement_date: '2025-08-01T00:00:00Z',
  },
  {
    name: 'email_conversion_rate',
    display_name: 'Email Conversion Rate',
    category: 'conversion',
    current_value: 4.8,
    target_value: 5.2,
    previous_value: 4.5,
    progress_percentage: 93.3,
    change_amount: 0.3,
    change_percentage: 6.7,
    status: 'below_target',
    trend_direction: 'up',
    unit_type: 'percentage',
    alert_level: 'warning',
    measurement_date: '2025-08-01T00:00:00Z',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Creating sample OKR data for organization:', organizationId);

    // Create sample OKR objectives
    const okrPromises = SAMPLE_OKR_DATA.map(okr => 
      supabase.from('okr_objectives').insert({
        organization_id: organizationId,
        ...okr,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );

    const okrResults = await Promise.all(okrPromises);
    const okrErrors = okrResults.filter(result => result.error);
    
    if (okrErrors.length > 0) {
      console.error('Errors creating OKR data:', okrErrors);
    }

    // Create sample KPI definitions if they don't exist
    const kpiDefinitionPromises = SAMPLE_KPI_DATA.map(async kpi => {
      // First check if definition exists
      const { data: existing } = await supabase
        .from('kpi_definitions')
        .select('id')
        .eq('name', kpi.name)
        .single();

      if (!existing) {
        return supabase.from('kpi_definitions').insert({
          name: kpi.name,
          display_name: kpi.display_name,
          description: `Sample ${kpi.display_name} metric`,
          category: kpi.category,
          data_source: 'internal',
          calculation_method: 'Automatically calculated',
          unit_type: kpi.unit_type,
          refresh_frequency: '1_minute',
          is_active: true,
        }).select('id').single();
      }
      
      return { data: existing, error: null };
    });

    const kpiDefinitionResults = await Promise.all(kpiDefinitionPromises);
    
    // Create sample KPI metrics
    const kpiMetricPromises = SAMPLE_KPI_DATA.map(async (kpi, index) => {
      const definitionResult = kpiDefinitionResults[index];
      if (definitionResult.error || !definitionResult.data) {
        console.error('Failed to get KPI definition for:', kpi.name);
        return;
      }

      return supabase.from('kpi_metrics').insert({
        kpi_definition_id: definitionResult.data.id,
        organization_id: organizationId,
        metric_value: kpi.current_value,
        previous_value: kpi.previous_value,
        target_value: kpi.target_value,
        variance_percentage: kpi.change_percentage,
        status: kpi.status,
        measurement_date: kpi.measurement_date,
        created_at: new Date().toISOString(),
      });
    });

    const kpiMetricResults = await Promise.all(kpiMetricPromises.filter(Boolean));
    const kpiErrors = kpiMetricResults.filter(result => result && result.error);
    
    if (kpiErrors.length > 0) {
      console.error('Errors creating KPI metrics:', kpiErrors);
    }

    return NextResponse.json({
      message: 'Sample data created successfully',
      results: {
        okr_objectives: SAMPLE_OKR_DATA.length - okrErrors.length,
        kpi_metrics: SAMPLE_KPI_DATA.length - kpiErrors.length,
        okr_errors: okrErrors.length,
        kpi_errors: kpiErrors.length,
      },
    });

  } catch (error) {
    console.error('Unexpected error creating sample data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}