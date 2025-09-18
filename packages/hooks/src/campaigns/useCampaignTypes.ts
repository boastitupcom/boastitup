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

  // Get campaign types performance from view_campaign_type_performance
  const { data, error } = await supabase
    .from('view_campaign_type_performance')
    .select('campaign_type_enum, roi, total_revenue, total_investment, number_of_campaigns')
    .eq('brand_id', brandId)
    .not('campaign_type_enum', 'is', null)
    .order('roi', { ascending: false });

  if (error) {
    console.error('Error fetching campaign types:', error.message);
    throw error;
  }

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

    return defaultTypes;
  }

  // Group by campaign_type_enum and calculate average performance
  const typePerformance = data.reduce((acc, item) => {
    const type = item.campaign_type_enum;
    if (!type) return acc; // Skip null campaign_type_enum

    if (!acc[type]) {
      acc[type] = { roiSum: 0, count: 0, campaigns: 0 };
    }
    // Handle null ROI values
    const roiValue = item.roi !== null && item.roi !== undefined ? Number(item.roi) : 0;
    const campaignCount = item.number_of_campaigns !== null && item.number_of_campaigns !== undefined ? Number(item.number_of_campaigns) : 0;

    acc[type].roiSum += roiValue;
    acc[type].count += 1;
    acc[type].campaigns += campaignCount;
    return acc;
  }, {} as Record<string, { roiSum: number; count: number; campaigns: number }>);

  // Convert to format expected by UI
  const formattedData = Object.entries(typePerformance).map(([type, stats]) => {
    const avgRoi = stats.count > 0 ? Math.round((stats.roiSum / stats.count) * 100) : 0;
    const typeKey = type as keyof typeof TYPE_METADATA;
    const metadata = TYPE_METADATA[typeKey];

    return {
      id: type,
      type: type as any, // Cast to CampaignType
      label: metadata?.label || type.charAt(0).toUpperCase() + type.slice(1),
      description: metadata?.description || `${type} campaign strategy`,
      roi_percentage: avgRoi,
      campaigns_count: stats.campaigns,
      icon_name: metadata?.icon || 'Target',
      ai_recommended: false, // This will be populated by a separate AI recommendations query
      selected: false
    };
  });

  return formattedData;
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