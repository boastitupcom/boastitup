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

    // Query okr_objectives table directly according to story.txt schema
    const { data: okrData, error: okrError } = await supabase
      .from('okr_objectives')
      .select(`
        id,
        tenant_id,
        brand_id,
        title,
        description,
        target_value,
        target_date_id,
        granularity,
        is_active,
        created_at,
        updated_at,
        master_template_id,
        dim_metric_type!inner(
          id,
          code,
          description,
          unit,
          category
        ),
        brands!inner(
          id,
          name,
          tenant_id
        )
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

    // Transform data from okr_objectives to client format
    const transformedData = (okrData || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      current_value: 0, // Default current value - will be updated via metrics tracking
      target_value: item.target_value,
      progress_percentage: 0, // Calculate based on current/target when metrics are available
      status: item.is_active ? 'active' : 'inactive',
      confidence_score: 0.75, // Default confidence score
      days_remaining: calculateDaysRemaining(item.target_date_id),
      change_amount: 0, // Will be calculated from metrics data
      change_percentage: 0, // Will be calculated from metrics data
      icon: getIconForMetricCode(item.dim_metric_type?.code || ''),
      metric_type: getMetricTypeFromCode(item.dim_metric_type?.code || ''),
      unit_type: item.dim_metric_type?.unit || 'count',
      target_date: item.target_date_id,
      color: getMetricColor(item.dim_metric_type?.code || ''),
      granularity: item.granularity,
      master_template_id: item.master_template_id,
      brand_name: item.brands?.name,
      is_active: item.is_active
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

function calculateDaysRemaining(targetDateId: number | null): number {
  if (!targetDateId) return 0;
  // This would normally query dim_date table, for now return a default
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 3); // Default 3 months
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
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
    const { brandId, tenantId, okrData } = body;
    
    if (!brandId || !tenantId || !okrData) {
      return NextResponse.json(
        { error: 'Brand ID, Tenant ID and OKR data are required' },
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

    // Insert or update OKR objective according to story.txt schema
    const { data, error } = await supabase
      .from('okr_objectives')
      .upsert({
        brand_id: brandId,
        tenant_id: tenantId,
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