import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import type { CampaignTypePerformance, CampaignTypeOption } from '@boastitup/types';

const supabase = createClient();

// Type labels, descriptions and icons
const TYPE_METADATA = {
  organic: {
    label: 'Organic',
    description: 'Build authentic connections through organic content',
    icon: 'Heart'
  },
  paid: {
    label: 'Paid',
    description: 'Targeted advertising for maximum reach',
    icon: 'Target'
  },
  hybrid: {
    label: 'Hybrid',
    description: 'Combined organic and paid strategy',
    icon: 'Zap'
  }
} as const;

const getCampaignTypes = async (brandId: string): Promise<CampaignTypeOption[]> => {
  if (!brandId || brandId.trim() === '') {
    throw new Error('Brand ID is required to fetch campaign types');
  }

  console.log('Fetching campaign types for brand:', brandId);

  // Get campaign types performance from view_campaign_type_performance using exact column names from def.txt
  const { data, error } = await supabase
    .from('view_campaign_type_performance')
    .select(`
      brand_id,
      product_id,
      campaign_type_enum,
      number_of_campaigns,
      total_revenue,
      total_investment,
      roi,
      total_impressions,
      total_reach,
      total_likes,
      total_comments,
      total_shares,
      total_conversions,
      cost_per_conversion
    `)
    .eq('brand_id', brandId)
    .not('campaign_type_enum', 'is', null)
    .order('roi', { ascending: false });

  if (error) {
    console.error('Error fetching campaign types:', error.message);
    throw error;
  }

  console.log('Raw campaign types data from database:', data);

  // Handle null/empty data - provide default types if no performance data exists
  if (!data || data.length === 0) {
    console.log('No campaign type performance data found for brand:', brandId, '- providing default types');

    // Return default types based on enum values when no performance data exists
    const defaultTypes = Object.entries(TYPE_METADATA).map(([typeKey, metadata]) => ({
      id: typeKey,
      type: typeKey as any,
      label: metadata.label,
      description: metadata.description,
      roi_percentage: 0, // No performance data available
      campaigns_count: 0,
      icon_name: metadata.icon,
      ai_recommended: false,
      selected: false
    }));

    console.log('Returning default types:', defaultTypes);
    return defaultTypes;
  }

  // Group by campaign_type_enum and calculate comprehensive performance metrics
  const typePerformance = data.reduce((acc, item) => {
    const type = item.campaign_type_enum;
    console.log('Processing type item:', {
      type,
      roi: item.roi,
      revenue: item.total_revenue,
      investment: item.total_investment,
      campaigns: item.number_of_campaigns,
      impressions: item.total_impressions,
      reach: item.total_reach,
      conversions: item.total_conversions
    });

    if (!type) return acc; // Skip null campaign_type_enum

    if (!acc[type]) {
      acc[type] = {
        roiSum: 0,
        count: 0,
        campaigns: 0,
        totalRevenue: 0,
        totalInvestment: 0,
        totalImpressions: 0,
        totalReach: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalConversions: 0,
        totalCostPerConversion: 0
      };
    }

    // Handle null values and ensure they're valid numbers
    const roiValue = item.roi !== null && item.roi !== undefined && !isNaN(Number(item.roi)) ? Number(item.roi) : 0;
    const campaignCount = item.number_of_campaigns !== null && item.number_of_campaigns !== undefined ? Number(item.number_of_campaigns) : 0;
    const revenue = item.total_revenue !== null && item.total_revenue !== undefined ? Number(item.total_revenue) : 0;
    const investment = item.total_investment !== null && item.total_investment !== undefined ? Number(item.total_investment) : 0;
    const impressions = item.total_impressions !== null && item.total_impressions !== undefined ? Number(item.total_impressions) : 0;
    const reach = item.total_reach !== null && item.total_reach !== undefined ? Number(item.total_reach) : 0;
    const likes = item.total_likes !== null && item.total_likes !== undefined ? Number(item.total_likes) : 0;
    const comments = item.total_comments !== null && item.total_comments !== undefined ? Number(item.total_comments) : 0;
    const shares = item.total_shares !== null && item.total_shares !== undefined ? Number(item.total_shares) : 0;
    const conversions = item.total_conversions !== null && item.total_conversions !== undefined ? Number(item.total_conversions) : 0;
    const costPerConversion = item.cost_per_conversion !== null && item.cost_per_conversion !== undefined ? Number(item.cost_per_conversion) : 0;

    acc[type].roiSum += roiValue;
    acc[type].count += 1;
    acc[type].campaigns += campaignCount;
    acc[type].totalRevenue += revenue;
    acc[type].totalInvestment += investment;
    acc[type].totalImpressions += impressions;
    acc[type].totalReach += reach;
    acc[type].totalLikes += likes;
    acc[type].totalComments += comments;
    acc[type].totalShares += shares;
    acc[type].totalConversions += conversions;
    acc[type].totalCostPerConversion += costPerConversion;

    return acc;
  }, {} as Record<string, {
    roiSum: number;
    count: number;
    campaigns: number;
    totalRevenue: number;
    totalInvestment: number;
    totalImpressions: number;
    totalReach: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalConversions: number;
    totalCostPerConversion: number;
  }>);

  console.log('Grouped type performance:', typePerformance);

  // Always show all 3 campaign types - merge live data with defaults
  const allTypes = Object.entries(TYPE_METADATA).map(([typeKey, metadata]) => {
    const liveData = typePerformance[typeKey];

    if (liveData) {
      const avgRoi = liveData.count > 0 ? (liveData.roiSum / liveData.count) * 100 : 0;
      return {
        id: typeKey,
        type: typeKey as any,
        label: metadata.label,
        description: metadata.description,
        roi_percentage: Math.round(avgRoi),
        campaigns_count: liveData.campaigns,
        icon_name: metadata.icon,
        ai_recommended: avgRoi > 40,
        selected: false,
        // All comprehensive metrics from view_campaign_type_performance
        total_revenue: liveData.totalRevenue,
        total_investment: liveData.totalInvestment,
        total_impressions: liveData.totalImpressions,
        total_reach: liveData.totalReach,
        total_likes: liveData.totalLikes,
        total_comments: liveData.totalComments,
        total_shares: liveData.totalShares,
        total_conversions: liveData.totalConversions,
        cost_per_conversion: liveData.count > 0 ? liveData.totalCostPerConversion / liveData.count : 0,
        engagement_rate: liveData.totalImpressions > 0 ? ((liveData.totalLikes + liveData.totalComments + liveData.totalShares) / liveData.totalImpressions) * 100 : 0
      };
    } else {
      // No live data for this type
      return {
        id: typeKey,
        type: typeKey as any,
        label: metadata.label,
        description: metadata.description,
        roi_percentage: 0,
        campaigns_count: 0,
        icon_name: metadata.icon,
        ai_recommended: false,
        selected: false,
        total_revenue: 0,
        total_investment: 0,
        total_impressions: 0,
        total_reach: 0,
        total_likes: 0,
        total_comments: 0,
        total_shares: 0,
        total_conversions: 0,
        cost_per_conversion: 0,
        engagement_rate: 0
      };
    }
  });

  console.log('All campaign types with live data:', allTypes);
  return allTypes;
};

export const useCampaignTypes = (brandId: string) => {
  return useQuery({
    queryKey: ['campaign-types', brandId],
    queryFn: () => getCampaignTypes(brandId),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};