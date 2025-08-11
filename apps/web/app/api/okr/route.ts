// apps/web/app/api/okr/route.ts
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

    // First, try to get user to ensure authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching OKR data for brand:', brandId, 'tenant:', tenantId);

    // Query the mv_okr_performance materialized view with brand and tenant context
    const { data: okrData, error: okrError } = await supabase
      .from('mv_okr_performance')
      .select(`
        objective_id,
        tenant_id,
        brand_id,
        title,
        description,
        target_value,
        target_date,
        metric_code,
        metric_description,
        metric_unit,
        current_value,
        progress_percentage,
        variance,
        days_remaining,
        status,
        confidence_score,
        last_metric_date,
        created_at
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (okrError) {
      console.error('Error fetching OKR data:', okrError);
      return NextResponse.json(
        { error: 'Failed to fetch OKR data', details: okrError.message },
        { status: 500 }
      );
    }

    // Transform data from mv_okr_performance to client format
    const transformedData = (okrData || []).map(item => ({
      id: item.objective_id,
      title: item.title || getMetricTitle(item.metric_code),
      description: item.description || getMetricDescription(item.metric_code),
      current_value: item.current_value,
      target_value: item.target_value,
      progress_percentage: item.progress_percentage,
      status: item.status, // Use the calculated status from the view
      confidence_score: item.confidence_score,
      days_remaining: item.days_remaining,
      change_amount: item.variance, // Using variance as change amount
      change_percentage: calculateChangePercentage(item.current_value, item.variance),
      icon: getIconForMetricCode(item.metric_code),
      metric_type: getMetricTypeFromCode(item.metric_code),
      unit_type: item.metric_unit || getUnitTypeFromCode(item.metric_code),
      target_date: item.target_date,
      color: getMetricColor(item.metric_code),
    }));

    console.log('Successfully fetched OKR data:', transformedData.length, 'items');

    return NextResponse.json({
      data: transformedData,
      count: transformedData.length,
      brand_id: brandId,
      tenant_id: tenantId,
    });

  } catch (error) {
    console.error('Unexpected error in OKR API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for data transformation
function getMetricTitle(metricCode: string): string {
  const titleMap: Record<string, string> = {
    'monthly_revenue': 'Monthly Revenue Target',
    'customer_acquisition': 'New Customer Acquisition',
    'average_order_value': 'Average Order Value',
    'repeat_purchase_rate': 'Repeat Purchase Rate',
    'conversion_rate': 'Conversion Rate',
    'customer_retention': 'Customer Retention Rate',
  };
  
  return titleMap[metricCode] || metricCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getMetricDescription(metricCode: string): string {
  const descMap: Record<string, string> = {
    'monthly_revenue': 'Increase monthly recurring revenue through improved conversion rates and customer acquisition',
    'customer_acquisition': 'Acquire new customers through targeted marketing campaigns and referral programs',
    'average_order_value': 'Increase average order value through upselling and cross-selling strategies',
    'repeat_purchase_rate': 'Improve customer retention and encourage repeat purchases',
    'conversion_rate': 'Optimize conversion funnel to increase purchase conversions',
    'customer_retention': 'Retain existing customers and reduce churn rate',
  };
  
  return descMap[metricCode] || `Track and optimize ${metricCode.replace(/_/g, ' ')} performance`;
}

function getIconForMetricCode(metricCode: string): string {
  const iconMap: Record<string, string> = {
    'monthly_revenue': 'TrendingUp',       // � Chart trending up
    'customer_acquisition': 'Users',       // 👥 Group of users
    'average_order_value': 'CircleDollarSign', // � Dollar in circle
    'repeat_purchase_rate': 'Repeat',      // 🔄 Repeat/cycle arrow
    'conversion_rate': 'ArrowUpCircle',    // ⬆️ Upward growth arrow
    'customer_retention': 'UserCheck',     // ✓ User with checkmark
  };
  
  return iconMap[metricCode] || 'Target';
}

function getMetricTypeFromCode(metricCode: string): 'revenue' | 'customers' | 'conversions' | 'engagement' {
  const typeMap: Record<string, 'revenue' | 'customers' | 'conversions' | 'engagement'> = {
    'monthly_revenue': 'revenue',
    'customer_acquisition': 'customers',
    'average_order_value': 'conversions',
    'repeat_purchase_rate': 'engagement',
    'conversion_rate': 'conversions',
    'customer_retention': 'customers',
  };
  
  return typeMap[metricCode] || 'conversions';
}

function getUnitTypeFromCode(metricCode: string): 'currency' | 'percentage' | 'count' | 'rate' {
  const unitMap: Record<string, 'currency' | 'percentage' | 'count' | 'rate'> = {
    'monthly_revenue': 'currency',
    'customer_acquisition': 'count',
    'average_order_value': 'currency',
    'repeat_purchase_rate': 'percentage',
    'conversion_rate': 'percentage',
    'customer_retention': 'percentage',
  };
  
  return unitMap[metricCode] || 'count';
}


function calculateChangePercentage(currentValue: number, changeValue: number): number {
  const previousValue = currentValue - changeValue;
  if (previousValue === 0) return 0;
  return (changeValue / previousValue) * 100;
}

function getMetricColor(metricCode: string): string {
  const colorMap: Record<string, string> = {
    'monthly_revenue': 'blue',         // Blue for revenue/financial metrics
    'customer_acquisition': 'violet',  // Violet for customer growth
    'average_order_value': 'orange',   // Orange for sales/order metrics
    'repeat_purchase_rate': 'green',   // Green for retention/loyalty metrics
    'conversion_rate': 'yellow',       // Yellow for conversion metrics
    'customer_retention': 'pink',      // Pink for customer-focused metrics
  };
  
  return colorMap[metricCode] || 'gray';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, okrData } = body;
    
    if (!organizationId || !okrData) {
      return NextResponse.json(
        { error: 'Organization ID and OKR data are required' },
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

    // Insert or update OKR objective
    const { data, error } = await supabase
      .from('okr_objectives')
      .upsert({
        organization_id: organizationId,
        ...okrData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving OKR data:', error);
      return NextResponse.json(
        { error: 'Failed to save OKR data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'OKR data saved successfully',
    });

  } catch (error) {
    console.error('Unexpected error in OKR POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}