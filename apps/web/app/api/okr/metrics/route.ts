// apps/web/app/api/okr/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get('brandId');
    const tenantId = searchParams.get('tenantId');
    
    if (!brandId || !tenantId) {
      return NextResponse.json(
        { error: 'Brand ID and Tenant ID are required' },
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

    // Query v_okr_performance view for real-time OKR data as defined in old.txt
    const { data: metricsData, error: metricsError } = await supabase
      .from('v_okr_performance')
      .select('*')
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .order('progress_percentage', { ascending: true });

    if (metricsError) {
      console.error('Error fetching metrics from v_okr_performance:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics data', details: metricsError.message },
        { status: 500 }
      );
    }

    // Transform data to expected format using real database fields
    const metricsWithCurrentValues = (metricsData || []).map(item => ({
      id: item.id,
      title: item.title,
      target_value: item.target_value,
      current_value: item.current_value,
      progress_percentage: item.progress_percentage,
      status: item.status,
      health: item.health,
      platform_name: item.platform_name,
      metric_description: item.metric_description,
      metric_unit: item.metric_unit,
      metric_category: item.metric_category,
      last_update_date: item.last_update_date,
      brand_id: item.brand_id,
      tenant_id: item.tenant_id
    }));

    return NextResponse.json({
      data: metricsWithCurrentValues,
      count: metricsWithCurrentValues.length,
      brand_id: brandId,
      tenant_id: tenantId
    });

  } catch (error) {
    console.error('Unexpected error in metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, tenantId, metricValues } = body;
    
    if (!brandId || !tenantId || !metricValues) {
      return NextResponse.json(
        { error: 'Brand ID, Tenant ID, and metric values are required' },
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

    // Insert real metric values into fact_metric_value table
    const { data: insertedData, error: insertError } = await supabase
      .from('fact_metric_value')
      .insert(
        metricValues.map((metric: any) => ({
          date_id: metric.date_id,
          platform_id: metric.platform_id,
          metric_type_id: metric.metric_type_id,
          value: metric.value,
          granularity: metric.granularity || 'daily',
          brand_id: brandId,
          tenant_id: tenantId,
          tags: metric.tags || null
        }))
      )
      .select();

    if (insertError) {
      console.error('Error inserting metric values:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert metric values', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Metrics updated successfully',
      updated_count: insertedData?.length || 0,
      timestamp: new Date().toISOString(),
      data: insertedData
    });

  } catch (error) {
    console.error('Unexpected error updating metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}