// apps/web/app/api/okr/metrics/tracking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

// This endpoint manages the okr_metrics_tracking table for storing current metric values
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

    // Query okr_metrics_tracking table with OKR objectives
    const { data: metricsData, error: metricsError } = await supabase
      .from('okr_metrics_tracking')
      .select(`
        id,
        okr_objective_id,
        current_value,
        measurement_date,
        data_source,
        confidence_level,
        created_at,
        updated_at,
        okr_objectives!inner(
          id,
          title,
          target_value,
          target_date_id,
          brand_id,
          tenant_id,
          dim_metric_type(
            id,
            code,
            description,
            unit,
            category
          )
        )
      `)
      .eq('okr_objectives.brand_id', brandId)
      .eq('okr_objectives.tenant_id', tenantId)
      .eq('okr_objectives.is_active', true)
      .order('measurement_date', { ascending: false });

    if (metricsError) {
      console.error('Error fetching metrics tracking data:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics data', details: metricsError.message },
        { status: 500 }
      );
    }

    // Transform to expected format
    const transformedData = (metricsData || []).map(item => {
      const okr = item.okr_objectives;
      const progressPercentage = okr.target_value > 0 ? (item.current_value / okr.target_value) * 100 : 0;
      
      return {
        id: okr.id,
        title: okr.title,
        target_value: okr.target_value,
        current_value: item.current_value,
        progress_percentage: Math.round(progressPercentage * 10) / 10,
        days_remaining: calculateDaysRemaining(okr.target_date_id),
        status: getStatusFromProgress(progressPercentage),
        unit: okr.dim_metric_type?.unit,
        metric_code: okr.dim_metric_type?.code,
        last_updated: item.updated_at,
        confidence_level: item.confidence_level,
        data_source: item.data_source
      };
    });

    return NextResponse.json({
      data: transformedData,
      count: transformedData.length,
      brand_id: brandId,
      tenant_id: tenantId
    });

  } catch (error) {
    console.error('Unexpected error in metrics tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { okrObjectiveId, currentValue, dataSource, confidenceLevel } = body;
    
    if (!okrObjectiveId || currentValue === undefined) {
      return NextResponse.json(
        { error: 'OKR Objective ID and current value are required' },
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

    // Insert new metrics tracking record
    const { data, error } = await supabase
      .from('okr_metrics_tracking')
      .insert({
        okr_objective_id: okrObjectiveId,
        current_value: currentValue,
        measurement_date: new Date().toISOString(),
        data_source: dataSource || 'manual',
        confidence_level: confidenceLevel || 0.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating metrics tracking record:', error);
      return NextResponse.json(
        { error: 'Failed to create metrics record', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Metrics tracking record created successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating metrics record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateDaysRemaining(targetDateId: number | null): number {
  if (!targetDateId) return 0;
  
  // In real implementation, this would query dim_date table
  // For now, calculate based on typical quarterly targets (90 days)
  const today = new Date();
  const targetDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getStatusFromProgress(progressPercentage: number): string {
  if (progressPercentage >= 100) return 'completed';
  if (progressPercentage >= 80) return 'on_track';
  if (progressPercentage >= 60) return 'at_risk';
  return 'behind';
}