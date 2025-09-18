import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import type { CampaignGoalROI, CampaignGoalOption } from '@boastitup/types';

const supabase = createClient();

// Icon mapping for campaign goals
const GOAL_ICONS = {
  awareness: 'Eye',
  engagement: 'MessageSquare',
  conversions: 'Target',
  leads: 'Users',
  retention: 'Heart'
} as const;

// Goal labels and descriptions
const GOAL_METADATA = {
  awareness: {
    label: 'Awareness',
    description: 'Build brand recognition and reach'
  },
  engagement: {
    label: 'Engagement',
    description: 'Boost interactions and community'
  },
  conversions: {
    label: 'Conversions',
    description: 'Drive sales and actions'
  },
  leads: {
    label: 'Leads',
    description: 'Generate qualified prospects'
  },
  retention: {
    label: 'Retention',
    description: 'Keep customers engaged'
  }
} as const;

const getCampaignGoals = async (brandId: string): Promise<CampaignGoalOption[]> => {
  if (!brandId || brandId.trim() === '') {
    throw new Error('Brand ID is required to fetch campaign goals');
  }

  // Get campaign goals using live data from view_campaign_goal_roi
  const { data, error } = await supabase
    .from('view_campaign_goal_roi')
    .select('campaign_goals, roi, total_revenue, total_investment')
    .eq('brand_id', brandId)
    .not('campaign_goals', 'is', null)
    .order('roi', { ascending: false });

  if (error) {
    console.error('Error fetching campaign goals:', error.message);
    throw error;
  }

  // Handle null/empty data - provide default goals if no performance data exists
  if (!data || data.length === 0) {
    console.log('No campaign goal performance data found for brand:', brandId, '- providing default goals');

    // Return default goals based on enum values when no performance data exists
    const defaultGoals = Object.entries(GOAL_METADATA).map(([goalKey, metadata]) => ({
      id: goalKey,
      type: goalKey as any,
      label: metadata.label,
      description: metadata.description,
      roi_percentage: 0, // No performance data available
      icon_name: GOAL_ICONS[goalKey as keyof typeof GOAL_ICONS],
      ai_recommended: false,
      selected: false
    }));

    return defaultGoals;
  }

  // Group by campaign_goals and calculate average ROI
  const goalPerformance = data.reduce((acc, item) => {
    const goal = item.campaign_goals;
    if (!goal) return acc; // Skip null campaign_goals

    if (!acc[goal]) {
      acc[goal] = { roiSum: 0, count: 0 };
    }
    // Handle null ROI values
    const roiValue = item.roi !== null && item.roi !== undefined ? Number(item.roi) : 0;
    acc[goal].roiSum += roiValue;
    acc[goal].count += 1;
    return acc;
  }, {} as Record<string, { roiSum: number; count: number }>);

  // Convert to format expected by UI
  const formattedData = Object.entries(goalPerformance).map(([goal, stats]) => {
    const avgRoi = stats.count > 0 ? Math.round((stats.roiSum / stats.count) * 100) : 0;
    const goalKey = goal as keyof typeof GOAL_METADATA;
    const metadata = GOAL_METADATA[goalKey];

    return {
      id: goal,
      type: goal as any, // Cast to CampaignGoals
      label: metadata?.label || goal.charAt(0).toUpperCase() + goal.slice(1),
      description: metadata?.description || `${goal} campaign objective`,
      roi_percentage: avgRoi,
      icon_name: GOAL_ICONS[goalKey] || 'Target',
      ai_recommended: false, // This will be populated by a separate AI recommendations query
      selected: false
    };
  });

  return formattedData;
};

export const useCampaignGoals = (brandId: string) => {
  return useQuery({
    queryKey: ['campaign-goals', brandId],
    queryFn: () => getCampaignGoals(brandId),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};