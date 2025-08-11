// apps/web/app/api/kpi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    
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

    console.log('Fetching KPI data for organization:', organizationId, 'categories:', categories);

    // Build the query for KPI scorecards
    let query = supabase
      .from('view_kpi_scorecards')
      .select(`
        id,
        name,
        display_name,
        category,
        current_value,
        target_value,
        previous_value,
        progress_percentage,
        change_amount,
        change_percentage,
        status,
        trend_direction,
        unit_type,
        alert_level,
        measurement_date
      `)
      .eq('organization_id', organizationId)
      .order('category')
      .order('display_name');

    // Apply category filters if specified
    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data: kpiData, error: kpiError } = await query;

    if (kpiError) {
      console.error('Error fetching KPI data:', kpiError);
      return NextResponse.json(
        { error: 'Failed to fetch KPI data', details: kpiError.message },
        { status: 500 }
      );
    }

    console.log('Successfully fetched KPI data:', (kpiData || []).length, 'items');

    return NextResponse.json({
      data: kpiData || [],
      count: (kpiData || []).length,
      organization_id: organizationId,
      filters: {
        categories: categories || [],
      },
    });

  } catch (error) {
    console.error('Unexpected error in KPI API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, kpiDefinitionId, metricData } = body;
    
    if (!organizationId || !kpiDefinitionId || !metricData) {
      return NextResponse.json(
        { error: 'Organization ID, KPI definition ID, and metric data are required' },
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

    // Insert new KPI metric
    const { data, error } = await supabase
      .from('kpi_metrics')
      .insert({
        organization_id: organizationId,
        kpi_definition_id: kpiDefinitionId,
        ...metricData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving KPI metric:', error);
      return NextResponse.json(
        { error: 'Failed to save KPI metric', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'KPI metric saved successfully',
    });

  } catch (error) {
    console.error('Unexpected error in KPI POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}