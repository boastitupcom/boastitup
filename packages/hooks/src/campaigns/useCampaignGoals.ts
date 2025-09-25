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

  console.log('Fetching campaign goals for brand:', brandId);

  // Get campaign goals using live data from view_campaign_goal_roi with exact column names from def.txt
  const { data, error } = await supabase
    .from('view_campaign_goal_roi')
    .select(`
      brand_id,
      product_id,
      campaign_goals,
      total_revenue,
      total_investment,
      roi
    `)
    .eq('brand_id', brandId)
    .not('campaign_goals', 'is', null)
    .order('roi', { ascending: false });

  if (error) {
    console.error('Error fetching campaign goals:', error.message);
    throw error;
  }

  console.log('Raw campaign goals data from database:', data);

  // Handle null/empty data - provide default goals if no performance data exists
  if (!data || data.length === 0) {
    console.log('No campaign goal performance data found for brand:', brandId, '- providing default goals');

    // Return default goals based on enum values when no performance data exists
    const dbEnumMapping = {
      'conversions': 'Conversion',
      'awareness': 'Awareness',
      'engagement': 'Engagement',
      'leads': 'Leads',
      'retention': 'Retention'
    };

    const defaultGoals = Object.entries(GOAL_METADATA).map(([goalKey, metadata]) => ({
      id: goalKey,
      type: dbEnumMapping[goalKey as keyof typeof dbEnumMapping], // Use database enum value
      label: metadata.label,
      description: metadata.description,
      roi_percentage: 0, // No performance data available
      icon_name: GOAL_ICONS[goalKey as keyof typeof GOAL_ICONS],
      ai_recommended: false,
      selected: false
    }));

    console.log('Returning default goals:', defaultGoals);
    return defaultGoals;
  }

  // Always show all 5 campaign goals - merge live data with defaults
  // Map goal keys to handle potential mismatches between enum values and data
  const goalMapping = {
    'Conversion': 'conversions',
    'Awareness': 'awareness',
    'Engagement': 'engagement',
    'Leads': 'leads',
    'Retention': 'retention'
  };

  // Map from internal keys to database enum values
  const dbEnumMapping = {
    'conversions': 'Conversion',
    'awareness': 'Awareness',
    'engagement': 'Engagement',
    'leads': 'Leads',
    'retention': 'Retention'
  };

  // Group live data by normalized goal names
  const liveDataByGoal = data.reduce((acc, item) => {
    const rawGoal = item.campaign_goals;
    if (!rawGoal) return acc;

    // Normalize goal name using mapping
    const normalizedGoal = goalMapping[rawGoal as keyof typeof goalMapping] || rawGoal.toLowerCase();

    if (!acc[normalizedGoal]) {
      acc[normalizedGoal] = {
        roiSum: 0,
        count: 0,
        totalRevenue: 0,
        totalInvestment: 0
      };
    }

    const roiValue = item.roi !== null && item.roi !== undefined && !isNaN(Number(item.roi)) ? Number(item.roi) : 0;
    const revenue = item.total_revenue !== null && item.total_revenue !== undefined ? Number(item.total_revenue) : 0;
    const investment = item.total_investment !== null && item.total_investment !== undefined ? Number(item.total_investment) : 0;

    acc[normalizedGoal].roiSum += roiValue;
    acc[normalizedGoal].count += 1;
    acc[normalizedGoal].totalRevenue += revenue;
    acc[normalizedGoal].totalInvestment += investment;

    return acc;
  }, {} as Record<string, { roiSum: number; count: number; totalRevenue: number; totalInvestment: number }>);

  // Create all 5 goals with live data where available
  const allGoals = Object.entries(GOAL_METADATA).map(([goalKey, metadata]) => {
    const liveData = liveDataByGoal[goalKey];

    if (liveData) {
      const avgRoi = liveData.count > 0 ? (liveData.roiSum / liveData.count) * 100 : 0;
      return {
        id: goalKey,
        type: dbEnumMapping[goalKey as keyof typeof dbEnumMapping], // Use database enum value
        label: metadata.label,
        description: metadata.description,
        roi_percentage: Math.round(avgRoi),
        icon_name: GOAL_ICONS[goalKey as keyof typeof GOAL_ICONS],
        ai_recommended: avgRoi > 50,
        selected: false,
        total_revenue: liveData.totalRevenue,
        total_investment: liveData.totalInvestment
      };
    } else {
      // No live data for this goal
      return {
        id: goalKey,
        type: dbEnumMapping[goalKey as keyof typeof dbEnumMapping], // Use database enum value
        label: metadata.label,
        description: metadata.description,
        roi_percentage: 0,
        icon_name: GOAL_ICONS[goalKey as keyof typeof GOAL_ICONS],
        ai_recommended: false,
        selected: false,
        total_revenue: 0,
        total_investment: 0
      };
    }
  });

  console.log('All campaign goals with live data:', allGoals);
  return allGoals;
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