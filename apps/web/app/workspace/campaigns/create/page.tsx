"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, Input, Label, Textarea, Badge, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@boastitup/ui";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  MessageSquare,
  Eye,
  Target,
  CheckCircle,
  Lightbulb,
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Palette,
  Heart,
  Zap
} from "lucide-react";
import { createClient } from "@boastitup/supabase/client";
import { useBrandStore } from "../../../../store/brandStore";
import type { CampaignGoalOption, CampaignTypeOption, CampaignFormData } from "@boastitup/types";
import { useCompetitorIntelligenceStore } from "../../../../store/competitorIntelligenceStore";
import { useCampaignIntelligenceData, useTrendingTopics } from "@boastitup/hooks/src/competitor-intelligence";
import { useBrandHealthScore } from "@boastitup/hooks/src/brand-health";
import { TrendingTopicsPanel } from "../../../../components/competitor-intelligence/TrendingTopicsPanel";
import { CompetitorIntelligencePanel } from "../../../../components/competitor-intelligence/CompetitorIntelligencePanel";
import { IntelligenceToggle } from "../../../../components/competitor-intelligence/IntelligenceToggle";
import { HashtagStrategyWorkflow } from "../../../../components/campaigns/HashtagStrategyWorkflow";
import EnhancedTrendsHashtagStrategy from "../../../../components/campaigns/EnhancedTrendsHashtagStrategy";
import ContentMixStrategy from "../../../../components/campaigns/ContentMixStrategy";
import AudienceSelection from "../../../../components/campaigns/AudienceSelection";
import TimingStrategy from "../../../../components/campaigns/TimingStrategy";
import CompetitorAudienceAnalysis from "../../../../components/campaigns/CompetitorAudienceAnalysis";
import {
  useCampaignAvailableHashtags,
  useCampaignSelectedHashtags,
  useAddHashtagToAvailable,
  useSelectHashtagForCampaign,
  useRemoveSelectedHashtag,
  useCampaignGoals,
  useCampaignTypes,
  useBrandProducts,
  useCampaignInsightsByCompetitor,
  useAIRecommendedActions
} from "@boastitup/hooks";
import BrandScoreCard from "../../../../components/brand-health/BrandScoreCard";

// Import types from packages

// Services
const supabase = createClient();

export const CampaignSetupService = {

  getBrandCurrency: async (brandId: string) => {
    const { data, error } = await supabase
      .from('brands')
      .select('currency_code, currency_symbol')
      .eq('id', brandId)
      .single();
    if (error) throw error;
    return data;
  },

  getCompetitorAverages: async (brandId: string) => {
    try {
      const { data, error } = await supabase
        .from('v_competitor_intelligence_dashboard')
        .select('estimated_campaign_budget')
        .eq('brand_id', brandId)
        .not('estimated_campaign_budget', 'is', null);

      if (error) {
        console.error('Error fetching competitor averages:', error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No competitor data available for this brand');
      }

      const average = data.reduce((sum, competitor) => sum + (competitor.estimated_campaign_budget || 0), 0) / data.length;
      return Math.round(average);
    } catch (error) {
      console.error('Failed to get competitor averages:', error);
      throw error;
    }
  },

};

const CampaignDraftService = {
  saveDraft: async (draftPayload: any) => {
    const { data, error } = await supabase
      .from('campaigns')
      .upsert({
        ...draftPayload,
        campaign_status: 'draft',
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        tenant_id,
        brand_id,
        created_by,
        campaign_name,
        campaign_type,
        campaign_goals,
        campaign_description,
        campaign_start_date,
        campaign_end_date,
        campaign_budget_allocated,
        campaign_status,
        created_at,
        updated_at
      `);
    if (error) throw error;
    return data;
  }
};

// Validation for Step 1 (Foundation only)
const validateStep1 = (data: CampaignFormData) => {
  const errors: Record<string, string> = {};

  if (!data.campaign_name.trim()) {
    errors.campaign_name = 'Campaign name is required';
  } else if (data.campaign_name.length < 3) {
    errors.campaign_name = 'Campaign name must be at least 3 characters';
  }

  if (!data.campaign_goals) {
    errors.campaign_goals = 'Please select a campaign goal';
  }

  if (!data.campaign_type) {
    errors.campaign_type = 'Please select a campaign type';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  showNextButton?: boolean;
  onNext?: () => void;
  nextButtonText?: string;
  isLoading?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  icon,
  isOpen,
  isCompleted,
  onToggle,
  children,
  showNextButton = true,
  onNext,
  nextButtonText = "Next",
  isLoading = false
}) => {
  return (
    <Card className="w-full border border-gray-200">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <CardContent className="pt-0 pb-6">
          {children}
          {showNextButton && onNext && (
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <Button
                onClick={onNext}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {nextButtonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBrand } = useBrandStore();
  const { intelligencePanelVisible, setIntelligencePanelVisible } = useCompetitorIntelligenceStore();

  // Section management
  const [activeSection, setActiveSection] = useState<number>(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Form State
  const [formData, setFormData] = useState<CampaignFormData>({
    campaign_name: '',
    campaign_goals: '',
    campaign_type: '',
    campaign_description: '',
    campaign_start_date: '',
    campaign_end_date: '',
    campaign_budget_allocated: 0, // Will be set based on competitor averages or user input
    product_id: 'all',
    campaign_platform: undefined,
  });

  // Campaign draft ID for hashtag workflow
  const [draftId, setDraftId] = useState<string | null>(null);

  // Load campaign intelligence data
  const {
    trendingTopics,
    competitorIntelligence,
    intelligenceInsights,
    brandCurrency,
    isLoading: intelligenceLoading
  } = useCampaignIntelligenceData(activeBrand?.id || '', formData.campaign_type);

  // Load brand health data
  const { data: brandHealthData, isLoading: brandHealthLoading } = useBrandHealthScore(
    activeBrand?.id || '',
    activeBrand?.tenant_id || ''
  );

  // Load campaign data using hooks
  const { data: campaignGoalsData = [], isLoading: goalsLoading } = useCampaignGoals(activeBrand?.id || '');
  const { data: campaignTypesData = [], isLoading: typesLoading } = useCampaignTypes(activeBrand?.id || '');

  // Load brand products
  const { data: brandProducts = [], isLoading: productsLoading } = useBrandProducts(activeBrand?.id || '');

  // Load AI recommendations and competitor insights
  const { data: aiRecommendations = [], isLoading: aiLoading } = useAIRecommendedActions(activeBrand?.id || '', formData.campaign_type || undefined);
  const { data: competitorInsights = [], isLoading: competitorLoading } = useCampaignInsightsByCompetitor(
    activeBrand?.id || '',
    formData.campaign_type || undefined,
    formData.product_id === 'all' ? undefined : formData.product_id || undefined
  );

  // UI State
  const [campaignGoals, setCampaignGoals] = useState<CampaignGoalOption[]>([]);
  const [campaignTypes, setCampaignTypes] = useState<CampaignTypeOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Icon mapping for campaign goals and types
  const iconMap = {
    MessageSquare: MessageSquare,
    Eye: Eye,
    Target: Target,
    Users: Users,
    Heart: Heart,
    Zap: Zap
  };

  // Pre-fill from URL parameters
  useEffect(() => {
    const suggestedName = searchParams?.get('suggested_name');
    const suggestedGoals = searchParams?.get('suggested_goals');
    const suggestedType = searchParams?.get('suggested_type');
    const context = searchParams?.get('context');
    const existingDraftId = searchParams?.get('draft_id');

    if (suggestedName) {
      setFormData(prev => ({ ...prev, campaign_name: suggestedName }));
    }
    if (suggestedGoals) {
      setFormData(prev => ({ ...prev, campaign_goals: suggestedGoals }));
    }
    if (suggestedType) {
      setFormData(prev => ({ ...prev, campaign_type: suggestedType }));
    }
    if (context) {
      setFormData(prev => ({ ...prev, campaign_description: context }));
    }
    if (existingDraftId) {
      setDraftId(existingDraftId);
    }
  }, [searchParams]);

  // Update state when hook data changes
  useEffect(() => {
    console.log('Campaign goals data from hook:', campaignGoalsData);
    if (campaignGoalsData && campaignGoalsData.length > 0) {
      const goalsWithIcons = campaignGoalsData.map(goal => {
        const IconComponent = iconMap[goal.icon_name as keyof typeof iconMap] || Target;
        console.log(`Processing goal: ${goal.label}, Icon: ${goal.icon_name}, ROI: ${goal.roi_percentage}`, IconComponent);

        return {
          ...goal,
          IconComponent,
          selected: formData.campaign_goals === goal.type
        };
      });
      console.log('Final goals with icons:', goalsWithIcons);
      setCampaignGoals(goalsWithIcons);
    }
  }, [campaignGoalsData, formData.campaign_goals]);

  useEffect(() => {
    console.log('Campaign types data from hook:', campaignTypesData);
    if (campaignTypesData && campaignTypesData.length > 0) {
      const typesWithSelection = campaignTypesData.map(type => {
        const IconComponent = iconMap[type.icon_name as keyof typeof iconMap] || Target;
        console.log(`Processing type: ${type.label}, Icon: ${type.icon_name}, ROI: ${type.roi_percentage}`, IconComponent);

        return {
          ...type,
          IconComponent,
          selected: formData.campaign_type === type.type
        };
      });
      console.log('Final types with icons:', typesWithSelection);
      setCampaignTypes(typesWithSelection);
    }
  }, [campaignTypesData, formData.campaign_type]);

  // Update loading state
  useEffect(() => {
    setIsLoading(goalsLoading || typesLoading);
  }, [goalsLoading, typesLoading]);

  // Brand currency is now handled by useCampaignIntelligenceData hook

  // Calculate timeline based on actual database data from trending topics and competitor intelligence
  const getInsightsTimeline = (insights: any[]) => {
    if (!insights || insights.length === 0) return 'No recent insights';

    // Since insights are generated client-side, check the underlying data sources
    // Get the most recent data from trending topics and competitor intelligence
    const now = new Date();
    let latestDataDate: Date | null = null;

    // Check trending topics data for latest trend_date
    if (trendingTopics && trendingTopics.length > 0) {
      const latestTrend = trendingTopics.reduce((latest, trend) => {
        const trendDate = new Date(trend.trend_date || trend.updated_at || trend.created_at);
        const latestDate = new Date(latest.trend_date || latest.updated_at || latest.created_at);
        return trendDate > latestDate ? trend : latest;
      });
      latestDataDate = new Date(latestTrend.trend_date || latestTrend.updated_at || latestTrend.created_at);
    }

    // Check competitor intelligence data for latest metric date
    if (competitorIntelligence && competitorIntelligence.length > 0) {
      const latestCompetitor = competitorIntelligence.reduce((latest, comp) => {
        const compDate = new Date(comp.last_benchmark_update || comp.competitor_relationship_updated_at);
        const latestDate = latest.last_benchmark_update ? new Date(latest.last_benchmark_update) : new Date(0);
        return compDate > latestDate ? comp : latest;
      });
      const competitorDate = new Date(latestCompetitor.last_benchmark_update || latestCompetitor.competitor_relationship_updated_at);

      if (!latestDataDate || competitorDate > latestDataDate) {
        latestDataDate = competitorDate;
      }
    }

    if (!latestDataDate) return 'Unknown';

    const diffInHours = Math.abs(now.getTime() - latestDataDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours <= 24) return 'Today';
    if (diffInHours <= 168) return 'This Week'; // 7 days * 24 hours
    if (diffInHours <= 720) return 'This Month'; // 30 days * 24 hours
    return 'Older';
  };

  // Form validation
  const isStep1Complete = useMemo(() => {
    return formData.campaign_name.trim().length >= 3 &&
           formData.campaign_goals !== '' &&
           formData.campaign_type !== '';
  }, [formData]);

  // Handle form changes
  const handleFormChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Auto-create draft when campaign name reaches 3+ characters
  useEffect(() => {
    const createDraftForHashtagStrategy = async () => {
      if (formData.campaign_name.trim().length >= 3 && !draftId && activeBrand?.id) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;

          const draftData = {
            tenant_id: activeBrand.tenant_id,
            brand_id: activeBrand.id,
            campaign_name: formData.campaign_name,
            campaign_goals: formData.campaign_goals || null, // Use campaign_goals enum
            campaign_type: formData.campaign_type || null, // Use campaign_type enum
            campaign_description: formData.campaign_description || null,
            campaign_start_date: formData.campaign_start_date && formData.campaign_start_date.trim() ? formData.campaign_start_date : null,
            campaign_end_date: formData.campaign_end_date && formData.campaign_end_date.trim() ? formData.campaign_end_date : null,
            campaign_budget_allocated: formData.campaign_budget_allocated || null,
            product_id: formData.product_id === 'all' ? null : formData.product_id || null,
            campaign_platform: formData.campaign_platform || null,
            created_by: userData.user.id
          };

          const result = await CampaignDraftService.saveDraft(draftData);
          if (result && result[0]?.id) {
            setDraftId(result[0].id);
          }
        } catch (error) {
          console.error('Failed to auto-create draft for hashtag strategy:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          toast.error(`Failed to auto-create draft: ${errorMessage}`);
        }
      }
    };

    createDraftForHashtagStrategy();
  }, [formData.campaign_name, formData.campaign_goals, formData.campaign_type, draftId, activeBrand?.id]);

  // Handle campaign goal selection
  const handleGoalSelection = (goalValue: string) => {
    setFormData(prev => ({ ...prev, campaign_goals: goalValue }));
    setCampaignGoals(prev => prev.map(goal => ({
      ...goal,
      selected: goal.type === goalValue
    })));

    // Clear goal selection error when user selects a goal
    if (errors.campaign_goals) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.campaign_goals;
        return newErrors;
      });
    }
  };

  // Handle campaign type selection
  const handleTypeSelection = (typeValue: string) => {
    setFormData(prev => ({ ...prev, campaign_type: typeValue }));
    setCampaignTypes(prev => prev.map(type => ({
      ...type,
      selected: type.type === typeValue
    })));

    // Clear type selection error when user selects a type
    if (errors.campaign_type) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.campaign_type;
        return newErrors;
      });
    }
  };

  // Section navigation
  const handleSectionToggle = (sectionIndex: number) => {
    setActiveSection(activeSection === sectionIndex ? -1 : sectionIndex);
  };

  const handleNextSection = async (currentSection: number) => {
    // Validate current section before proceeding
    if (currentSection === 0) {
      const validation = validateStep1(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('Please complete all required fields');
        return;
      }

      // Save draft for section 0
      await handleSaveDraft();

      // Mark section as completed
      setCompletedSections(prev => new Set([...prev, currentSection]));
    }

    // Move to next section
    const nextSection = currentSection + 1;
    setActiveSection(nextSection);
  };

  // Save draft
  const handleSaveDraft = async () => {
    // Don't save if form is completely empty
    if (!formData.campaign_name.trim() && !formData.campaign_goals && !formData.campaign_type && !formData.campaign_description.trim()) {
      toast.error('Please fill in some details before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please log in to save draft');
        return;
      }

      const draftData = {
        campaign_name: formData.campaign_name,
        campaign_goals: formData.campaign_goals, // Use campaign_goals enum
        campaign_type: formData.campaign_type, // Use campaign_type enum
        campaign_description: formData.campaign_description,
        campaign_start_date: formData.campaign_start_date && formData.campaign_start_date.trim() ? formData.campaign_start_date : null,
        campaign_end_date: formData.campaign_end_date && formData.campaign_end_date.trim() ? formData.campaign_end_date : null,
        campaign_budget_allocated: formData.campaign_budget_allocated,
        product_id: formData.product_id === 'all' ? null : formData.product_id || null,
        campaign_platform: formData.campaign_platform || null,
        brand_id: activeBrand?.id,
        tenant_id: activeBrand.tenant_id,
        created_by: user.user.id
      };

      const result = await CampaignDraftService.saveDraft(draftData);
      if (result && result[0]?.id) {
        setDraftId(result[0].id);
      }
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save draft: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Continue to step 2
  const handleContinueToStep2 = async () => {
    const validation = validateStep1(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the form errors before continuing');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please log in to continue');
        return;
      }

      const draftData = {
        campaign_name: formData.campaign_name,
        campaign_goals: formData.campaign_goals, // Use campaign_goals enum
        campaign_type: formData.campaign_type, // Use campaign_type enum
        campaign_description: formData.campaign_description,
        campaign_start_date: formData.campaign_start_date && formData.campaign_start_date.trim() ? formData.campaign_start_date : null,
        campaign_end_date: formData.campaign_end_date && formData.campaign_end_date.trim() ? formData.campaign_end_date : null,
        campaign_budget_allocated: formData.campaign_budget_allocated,
        product_id: formData.product_id === 'all' ? null : formData.product_id || null,
        campaign_platform: formData.campaign_platform || null,
        brand_id: activeBrand?.id,
        tenant_id: activeBrand.tenant_id,
        created_by: user.user.id
      };

      const result = await CampaignDraftService.saveDraft(draftData);
      toast.success('Step 1 saved successfully!');
      
      // Navigate to step 2 with draft ID
      if (result && result.length > 0) {
        router.push(`/workspace/campaigns/create/step-2?draft_id=${result[0].id}`);
      } else {
        router.push('/workspace/campaigns/create/step-2');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save progress: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date constraints
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];
  const minDate = new Date().toISOString().split('T')[0];

  // All intelligence data is loaded via useCampaignIntelligenceData hook

  const sections = [
    {
      title: "Campaign Foundation",
      subtitle: "Set your campaign name and primary objective",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Trends & Hashtag Strategy",
      subtitle: "AI-powered trend analysis and hashtag optimization",
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />
    },
    {
      title: "Competition Insights & Resources",
      subtitle: "Analyze competitors and set campaign parameters",
      icon: <Brain className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Audience & Content Strategy",
      subtitle: "Define target audience and content distribution",
      icon: <Users className="w-6 h-6 text-green-600" />
    },
    {
      title: "AI Creative Generation",
      subtitle: "AI-powered content ideas and brand guidelines",
      icon: <Palette className="w-6 h-6 text-pink-600" />
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">BoastItUp</h1>
              </div>
              <p className="text-gray-600">AI-Powered Campaign Builder</p>
              {/* Progress indicator */}
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 mx-auto">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((completedSections.size + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">

          {/* Section 1: Campaign Foundation */}
          <CollapsibleSection
            title={sections[0].title}
            subtitle={sections[0].subtitle}
            icon={sections[0].icon}
            isOpen={activeSection === 0}
            isCompleted={completedSections.has(0)}
            onToggle={() => handleSectionToggle(0)}
            onNext={() => handleNextSection(0)}
            isLoading={isSubmitting}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Brand Health Insights */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Brand Health Insights</h3>
                </div>
                <BrandScoreCard
                  score={brandHealthData?.overall_score || 72}
                  isLoading={brandHealthLoading}
                  brandHealthData={brandHealthData}
                  size="sm"
                />

                {/* AI Suggested Actions */}
                {aiRecommendations.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {aiRecommendations.slice(0, 1).map((recommendation, index) => (
                      <div key={recommendation.id} className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`text-white text-xs px-2 py-1 ${
                            recommendation.action_priority === 'high' ? 'bg-red-500' :
                            recommendation.action_priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {recommendation.action_priority.toUpperCase()} PRIORITY
                          </Badge>
                          {recommendation.action_confidence_score && (
                            <span className="text-teal-600 text-sm">
                              {Math.round(recommendation.action_confidence_score * 100)}% Confidence
                            </span>
                          )}
                        </div>
                        <h3 className="text-gray-900 font-semibold mb-2">AI-Generated Suggestion</h3>
                        <p className="text-gray-700 text-sm mb-4">
                          {recommendation.suggested_action_text}
                        </p>
                        {recommendation.action_description && (
                          <p className="text-gray-600 text-xs mb-3">
                            {recommendation.action_description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Impact: <span className={`${
                              recommendation.action_priority === 'high' ? 'text-red-600' :
                              recommendation.action_priority === 'medium' ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {recommendation.action_priority}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Stage: <span className="text-gray-900">{recommendation.stage}</span>
                          </span>
                        </div>
                        {recommendation.suggested_budget && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Suggested Budget: </span>
                            <span className="font-medium text-gray-900">
                              {recommendation.suggested_budget_currency_symbol || '$'}{recommendation.suggested_budget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Campaign Setup */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Campaign Setup</h3>
                </div>

                <div className="space-y-6">
                  {/* Campaign Name */}
                  <div>
                    <Label htmlFor="campaign_name" className="text-gray-900 flex items-center">
                      Campaign Name
                      <Lightbulb className="w-4 h-4 ml-2 text-blue-500" />
                    </Label>
                    <div className="relative">
                      <Input
                        id="campaign_name"
                        value={formData.campaign_name}
                        onChange={(e) => handleFormChange('campaign_name', e.target.value)}
                        placeholder="Enter campaign name"
                        className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${errors.campaign_name ? 'border-red-500' : ''}`}
                      />
                      <Button
                        size="sm"
                        className="absolute right-2 top-2 h-6 px-2 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Regen
                      </Button>
                    </div>
                    {errors.campaign_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.campaign_name}</p>
                    )}
                  </div>

                  {/* Product Selection */}
                  <div>
                    <Label htmlFor="product_id" className="text-gray-900 flex items-center">
                      Select Product
                      <span className="w-4 h-4 ml-2 text-blue-500 rounded-full border border-blue-300 flex items-center justify-center text-xs">i</span>
                    </Label>
                    {productsLoading ? (
                      <div className="bg-white border border-gray-300 rounded-md p-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    ) : brandProducts.length > 0 ? (
                      <Select
                        value={formData.product_id}
                        onValueChange={(value) => handleFormChange('product_id', value)}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Choose a product for this campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          {brandProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{product.name}</span>
                                {product.description && (
                                  <span className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">
                          No products found. Add products to your brand to select specific campaign targets.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Campaign Goal */}
                  <div>
                    <Label className="text-gray-700 text-sm font-medium flex items-center mb-4">
                      Campaign Goal
                      <span className="w-4 h-4 ml-2 text-blue-500 rounded-full border border-blue-300 flex items-center justify-center text-xs">i</span>
                    </Label>
                    {goalsLoading ? (
                      <div className="grid grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="w-8 h-8 mb-3 rounded-full bg-gray-200 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : campaignGoals.length > 0 ? (
                      <div className="grid grid-cols-5 gap-3">
                        {campaignGoals.map((goal) => {
                          const IconComponent = goal.IconComponent || Target;
                          const hasROI = goal.roi_percentage !== undefined && goal.roi_percentage !== 0;

                          return (
                            <div
                              key={goal.type}
                              className={`relative rounded-lg border p-4 cursor-pointer transition-all text-center bg-white hover:shadow-md ${
                                goal.selected ? 'border-blue-500 shadow-md' : 'border-gray-200'
                              }`}
                              onClick={() => handleGoalSelection(goal.type)}
                            >
                              {goal.ai_recommended && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                                  AI Pick
                                </Badge>
                              )}
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 mb-3 flex items-center justify-center">
                                  <IconComponent className="w-6 h-6 text-gray-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{goal.label}</h4>
                                <p className="text-xs text-gray-500 leading-tight mb-3">{goal.description}</p>

                                {/* ROI Display - Styled like the image */}
                                <div className={`text-sm font-semibold px-3 py-1 rounded ${
                                  hasROI && goal.roi_percentage > 0
                                    ? 'bg-green-100 text-green-700'
                                    : hasROI && goal.roi_percentage < 0
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {hasROI ? (
                                    <>ROI: {goal.roi_percentage > 0 ? '+' : ''}{goal.roi_percentage}%</>
                                  ) : (
                                    'No data'
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : !goalsLoading ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-500 text-sm">
                          No campaign data found. Campaign goals will appear here once you have created campaigns with performance data.
                        </p>
                      </div>
                    ) : null}
                    {errors.campaign_goals && (
                      <p className="text-sm text-red-500 mt-1">{errors.campaign_goals}</p>
                    )}
                  </div>

                  {/* Campaign Type */}
                  <div>
                    <Label className="text-gray-700 text-sm font-medium flex items-center mb-4">
                      Campaign Type
                      <span className="w-4 h-4 ml-2 text-blue-500 rounded-full border border-blue-300 flex items-center justify-center text-xs">i</span>
                    </Label>
                    {typesLoading ? (
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : campaignTypes.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {campaignTypes.map((type) => {
                          const IconComponent = type.IconComponent || Target;
                          const hasROI = type.roi_percentage !== undefined && type.roi_percentage !== 0;

                          return (
                            <div
                              key={type.type}
                              className={`relative rounded-lg border p-6 cursor-pointer transition-all bg-white hover:shadow-md ${
                                type.selected ? 'border-blue-500 shadow-md' : 'border-gray-200'
                              }`}
                              onClick={() => handleTypeSelection(type.type)}
                            >
                              {type.ai_recommended && (
                                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                                  AI Pick
                                </Badge>
                              )}
                              <div className="flex flex-col items-center text-center">
                                <div className="w-8 h-8 mb-3 flex items-center justify-center">
                                  <IconComponent className="w-6 h-6 text-gray-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-base mb-1">{type.label}</h4>

                                {/* ROI Display - Styled like the image */}
                                <div className={`text-sm font-semibold mb-3 px-3 py-1 rounded ${
                                  hasROI && type.roi_percentage > 0
                                    ? 'bg-green-100 text-green-700'
                                    : hasROI && type.roi_percentage < 0
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {hasROI ? (
                                    <>ROI: {type.roi_percentage > 0 ? '+' : ''}{type.roi_percentage}%</>
                                  ) : (
                                    'No data'
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 leading-tight">{type.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : !typesLoading ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-500 text-sm">
                          No campaign data found. Campaign types will appear here once you have created campaigns with performance data.
                        </p>
                      </div>
                    ) : null}
                    {errors.campaign_type && (
                      <p className="text-sm text-red-500 mt-1">{errors.campaign_type}</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Trends & Hashtag Strategy */}
          <CollapsibleSection
            title={sections[1].title}
            subtitle={sections[1].subtitle}
            icon={sections[1].icon}
            isOpen={activeSection === 1}
            isCompleted={completedSections.has(1)}
            onToggle={() => handleSectionToggle(1)}
            onNext={() => handleNextSection(1)}
            isLoading={false}
          >
            {/* Enhanced Trends & Hashtag Strategy */}
            {formData.campaign_name.trim().length >= 3 ? (
              draftId ? (
                <EnhancedTrendsHashtagStrategy
                  campaignId={draftId}
                  selectedProductId={formData.product_id}
                  budget={formData.campaign_budget_allocated}
                  onPlatformChange={(platform) => handleFormChange('campaign_platform', platform)}
                />
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center mb-3">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Trends & Hashtag Strategy
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Save your campaign to unlock enhanced trends analysis, platform filtering, and hashtag strategy tools.
                  </p>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save & Enable Enhanced Tools
                      </>
                    )}
                  </Button>
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75">
                <h3 className="font-semibold text-gray-600 flex items-center mb-2">
                  <Target className="w-5 h-5 mr-2" />
                  Trends & Hashtag Strategy
                </h3>
                <p className="text-gray-500 text-sm">
                  Complete your campaign foundation to unlock enhanced trends analysis and hashtag strategy tools
                </p>
              </div>
            )}
          </CollapsibleSection>

          {/* Section 3: Competition Insights & Resources */}
          <CollapsibleSection
            title={sections[2].title}
            subtitle={sections[2].subtitle}
            icon={sections[2].icon}
            isOpen={activeSection === 2}
            isCompleted={completedSections.has(2)}
            onToggle={() => handleSectionToggle(2)}
            onNext={() => handleNextSection(2)}
            isLoading={false}
          >
            <div className="space-y-8">
              {/* Competitor Intelligence Panel - Full Width */}
              <CompetitorIntelligencePanel
                competitors={competitorIntelligence}
                isLoading={intelligenceLoading}
                onCompetitorSelect={(competitor) => {
                  console.log('Selected competitor:', competitor);
                }}
              />

              {/* Campaign Type & Product Specific Insights */}
              {formData.campaign_type && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Campaign Intelligence
                      {formData.product_id && formData.product_id !== 'all' && brandProducts.find(p => p.id === formData.product_id) && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          for {brandProducts.find(p => p.id === formData.product_id)?.name}
                        </span>
                      )}
                    </h3>
                  </div>

                  {competitorLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : competitorInsights.length > 0 ? (
                    <div className="space-y-6">
                      {/* Performance Metrics Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Avg Engagement Rate</h4>
                          <p className="text-2xl font-bold text-blue-600">
                            {competitorInsights.length > 0 &&
                              (competitorInsights.reduce((sum, insight) => sum + (insight.avg_engagement_rate || 0), 0) / competitorInsights.length).toFixed(1)
                            }%
                          </p>
                          <p className="text-sm text-blue-600 mt-1">Competitor average</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-2">Avg ROI</h4>
                          <p className="text-2xl font-bold text-green-600">
                            {competitorInsights.length > 0 &&
                              (competitorInsights.reduce((sum, insight) => sum + (insight.roi || 0), 0) / competitorInsights.length).toFixed(1)
                            }%
                          </p>
                          <p className="text-sm text-green-600 mt-1">Competitor average</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h4 className="font-medium text-orange-900 mb-2">Avg Spend</h4>
                          <p className="text-2xl font-bold text-orange-600">
                            {brandCurrency?.currency_symbol || '$'}
                            {competitorInsights.length > 0 &&
                              (competitorInsights.reduce((sum, insight) => sum + (insight.competitor_avg_spend || 0), 0) / competitorInsights.length).toLocaleString()
                            }
                          </p>
                          <p className="text-sm text-orange-600 mt-1">Competitor average</p>
                        </div>
                      </div>

                      {/* Detailed Competitor Breakdown */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Competitor Performance Details</h4>
                        <div className="space-y-3">
                          {competitorInsights.slice(0, 3).map((insight, index) => (
                            <div key={`${insight.competitor_id}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Engagement:</span>
                                  <p className="font-medium text-gray-900">{insight.avg_engagement_rate?.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">ROI:</span>
                                  <p className={`font-medium ${insight.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {insight.roi?.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Spend:</span>
                                  <p className="font-medium text-gray-900">
                                    {brandCurrency?.currency_symbol || '$'}{insight.competitor_avg_spend?.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Revenue:</span>
                                  <p className="font-medium text-gray-900">
                                    {brandCurrency?.currency_symbol || '$'}{insight.total_attributed_revenue?.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Campaign Type:</span>
                                  <p className="font-medium text-gray-900 capitalize">{insight.campaign_type_enum}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500 text-sm">
                        No competitor insights available for this campaign type
                        {formData.product_id && formData.product_id !== 'all' && brandProducts.find(p => p.id === formData.product_id) &&
                          ` and product (${brandProducts.find(p => p.id === formData.product_id)?.name})`
                        }.
                        Data will appear here once competitor analysis is available.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 4: Audience & Content Strategy */}
          <CollapsibleSection
            title={sections[3].title}
            subtitle={sections[3].subtitle}
            icon={sections[3].icon}
            isOpen={activeSection === 3}
            isCompleted={completedSections.has(3)}
            onToggle={() => handleSectionToggle(3)}
            onNext={() => handleNextSection(3)}
            showNextButton={false}
            isLoading={false}
          >
            <div className="space-y-6">
              {/* Competitor Audience Analysis */}
              <CompetitorAudienceAnalysis campaignId={draftId || undefined} />

              {/* Content Mix Strategy */}
              <ContentMixStrategy campaignId={draftId || undefined} />

              {/* Audience Selection */}
              <AudienceSelection campaignId={draftId || undefined} />

              {/* Timing Strategy */}
              <TimingStrategy campaignId={draftId || undefined} />
            </div>
          </CollapsibleSection>

          {/* Section 5: AI Creative Generation */}
          <CollapsibleSection
            title={sections[4].title}
            subtitle={sections[4].subtitle}
            icon={sections[4].icon}
            isOpen={activeSection === 4}
            isCompleted={completedSections.has(4)}
            onToggle={() => handleSectionToggle(4)}
            showNextButton={false}
            isLoading={false}
          >
            <div className="text-center py-8">
              <Palette className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">AI-powered content creation and brand guidelines</p>
            </div>
          </CollapsibleSection>

          {/* Campaign Summary */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Campaign:</span>
                  <p className="font-medium">{formData.campaign_name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Goal:</span>
                  <p className="font-medium">
                    {campaignGoals.find(g => g.type === formData.campaign_goals)?.label || formData.campaign_goals || 'Not selected'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium">
                    {campaignTypes.find(t => t.type === formData.campaign_type)?.label || formData.campaign_type || 'Not selected'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Platform:</span>
                  <p className="font-medium capitalize">
                    {formData.campaign_platform || 'Not selected'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <p className="font-medium">{brandCurrency?.currency_symbol || '$'}{formData.campaign_budget_allocated?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
    </div>
  );
}

