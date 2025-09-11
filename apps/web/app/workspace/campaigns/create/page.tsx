"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@boastitup/ui";
import { Input } from "@boastitup/ui";
import { Label } from "@boastitup/ui";
import { Textarea } from "@boastitup/ui";
import { Badge } from "@boastitup/ui";
import { Slider } from "@boastitup/ui";
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
} from "lucide-react";
import { createClient } from "@boastitup/supabase/client";
import { useBrandStore } from "../../../../store/brandStore";
import { useCompetitorIntelligenceStore } from "../../../../store/competitorIntelligenceStore";
import { useCampaignIntelligenceData } from "@boastitup/hooks/src/competitor-intelligence";
import { TrendingTopicsPanel } from "../../../../components/competitor-intelligence/TrendingTopicsPanel";
import { CompetitorIntelligencePanel } from "../../../../components/competitor-intelligence/CompetitorIntelligencePanel";
import { IntelligenceToggle } from "../../../../components/competitor-intelligence/IntelligenceToggle";

// Types
interface CampaignFormData {
  campaign_name: string;
  campaign_type: string;
  campaign_description: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_budget_allocated: number;
}

interface CampaignType {
  type: string;
  label: string;
  roi_percentage: number;
  icon_name: string;
  IconComponent: any;
  selected: boolean;
}

// Services
const supabase = createClient();

export const CampaignSetupService = {
  getCampaignTypes: async () => {
    try {
      const { data, error } = await supabase
        .from('view_campaign_type_roi')
        .select('campaign_type_slug, campaign_type_name, icon_name, average_roi_percentage, color, bg_gradient');
      if (error) {
        console.error('Error fetching campaign types:', error.message);
        throw error;
      }
      const formattedData = data?.map(item => ({
        type: item.campaign_type_slug,
        label: item.campaign_type_name,
        roi_percentage: Math.round(item.average_roi_percentage || 0),
        icon_name: item.icon_name,
        color: item.color,
        bg_gradient: item.bg_gradient
      })) || [];
      return formattedData;
    } catch (error) {
      console.error('Failed to get campaign types.', error);
      return [];
    }
  },

  getBrandCurrency: async (brandId: string) => {
    const { data, error } = await supabase
      .from('brands')
      .select('currency_code, currency_symbol')
      .eq('id', brandId)
      .single();
    if (error) throw error;
    return data;
  },

  getCompetitorAverages: () => {
    return Promise.resolve(4200); // Static dummy value
  }
};

const CampaignDraftService = {
  saveDraft: async (draftPayload: any) => {
    const { data, error } = await supabase
      .from('campaign_drafts')
      .upsert({
        ...draftPayload,
        last_updated: new Date().toISOString()
      })
      .select(`
        id,
        tenant_id,
        brand_id,
        created_by,
        campaign_name,
        campaign_type,
        campaign_description,
        campaign_start_date,
        campaign_end_date,
        campaign_budget_allocated,
        campaign_platforms,
        campaign_content,
        campaign_targeting,
        step_completed,
        draft_status,
        source_insight_id,
        last_updated,
        created_at,
        expires_at,
        brands(name)
      `);
    if (error) throw error;
    return data;
  }
};

// Validation
const validateStep1 = (data: CampaignFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.campaign_name.trim()) {
    errors.campaign_name = 'Campaign name is required';
  } else if (data.campaign_name.length < 3) {
    errors.campaign_name = 'Campaign name must be at least 3 characters';
  }
  
  if (!data.campaign_type) {
    errors.campaign_type = 'Please select a campaign type';
  }
  
  if (!data.campaign_start_date) {
    errors.campaign_start_date = 'Start date is required';
  }
  
  if (!data.campaign_end_date) {
    errors.campaign_end_date = 'End date is required';
  } else if (new Date(data.campaign_end_date) <= new Date(data.campaign_start_date)) {
    errors.campaign_end_date = 'End date must be after start date';
  }
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (new Date(data.campaign_end_date) > maxDate) {
    errors.campaign_end_date = 'Campaign cannot extend more than 1 year from now';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBrand } = useBrandStore();
  const { intelligencePanelVisible, setIntelligencePanelVisible } = useCompetitorIntelligenceStore();

  // Form State
  const [formData, setFormData] = useState<CampaignFormData>({
    campaign_name: '',
    campaign_type: '',
    campaign_description: '',
    campaign_start_date: '',
    campaign_end_date: '',
    campaign_budget_allocated: 2500,
  });

  // Load campaign intelligence data
  const {
    trendingTopics,
    competitorIntelligence,
    intelligenceInsights,
    brandCurrency,
    isLoading: intelligenceLoading
  } = useCampaignIntelligenceData(activeBrand?.id || '', formData.campaign_type);

  // UI State
  const [campaignTypes, setCampaignTypes] = useState<CampaignType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    MessageSquare: MessageSquare,
    Eye: Eye,
    Target: Target
  };

  // Pre-fill from URL parameters
  useEffect(() => {
    const suggestedName = searchParams?.get('suggested_name');
    const suggestedType = searchParams?.get('suggested_type');
    const context = searchParams?.get('context');
    
    if (suggestedName) {
      setFormData(prev => ({ ...prev, campaign_name: suggestedName }));
    }
    if (suggestedType) {
      setFormData(prev => ({ ...prev, campaign_type: suggestedType }));
    }
    if (context) {
      setFormData(prev => ({ ...prev, campaign_description: context }));
    }
  }, [searchParams]);

  // Load campaign types
  useEffect(() => {
    const loadCampaignTypes = async () => {
      try {
        const dbTypes = await CampaignSetupService.getCampaignTypes();
        const typesWithIcons = dbTypes.map(type => ({
          type: type.type,
          label: type.label,
          roi_percentage: type.roi_percentage,
          icon_name: type.icon_name,
          IconComponent: iconMap[type.icon_name as keyof typeof iconMap] || MessageSquare,
          selected: formData.campaign_type === type.type
        }));
        setCampaignTypes(typesWithIcons);
      } catch (err) {
        console.error('Failed to load campaign types:', err);
        // Fallback data if database fails
        setCampaignTypes([
          {
            type: 'engagement',
            label: 'Engagement',
            roi_percentage: 35,
            icon_name: 'MessageSquare',
            IconComponent: MessageSquare,
            selected: formData.campaign_type === 'engagement'
          },
          {
            type: 'awareness',
            label: 'Awareness',
            roi_percentage: 25,
            icon_name: 'Eye',
            IconComponent: Eye,
            selected: formData.campaign_type === 'awareness'
          },
          {
            type: 'conversion',
            label: 'Conversion',
            roi_percentage: 45,
            icon_name: 'Target',
            IconComponent: Target,
            selected: formData.campaign_type === 'conversion'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignTypes();
  }, [formData.campaign_type]);

  // Brand currency is now handled by useCampaignIntelligenceData hook

  // Form validation
  const isStep1Complete = useMemo(() => {
    return formData.campaign_name.trim().length >= 3 &&
           formData.campaign_type !== '' &&
           formData.campaign_start_date !== '' &&
           formData.campaign_end_date !== '' &&
           new Date(formData.campaign_start_date) < new Date(formData.campaign_end_date);
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

  // Save draft
  const handleSaveDraft = async () => {
    // Don't save if form is completely empty
    if (!formData.campaign_name.trim() && !formData.campaign_type && !formData.campaign_description.trim()) {
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
        campaign_type: formData.campaign_type,
        campaign_description: formData.campaign_description,
        campaign_start_date: formData.campaign_start_date,
        campaign_end_date: formData.campaign_end_date,
        campaign_budget_allocated: formData.campaign_budget_allocated,
        step_completed: 1,
        brand_id: activeBrand?.id,
        tenant_id: user.user.user_metadata?.tenant_id || 'default_tenant',
        created_by: user.user.id,
        source_insight_id: searchParams?.get('insight_id'),
        draft_status: 'in_progress'
      };

      await CampaignDraftService.saveDraft(draftData);
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft. Please try again.');
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
        campaign_type: formData.campaign_type,
        campaign_description: formData.campaign_description,
        campaign_start_date: formData.campaign_start_date,
        campaign_end_date: formData.campaign_end_date,
        campaign_budget_allocated: formData.campaign_budget_allocated,
        step_completed: 1,
        brand_id: activeBrand?.id,
        tenant_id: user.user.user_metadata?.tenant_id || 'default_tenant',
        created_by: user.user.id,
        source_insight_id: searchParams?.get('insight_id'),
        draft_status: 'step_1_complete'
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
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date constraints
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];
  const minDate = new Date().toISOString().split('T')[0];

  // Optimization tips based on campaign type
  const optimizationTips = {
    engagement: "💡 Optimal: Mondays show +25% engagement",
    awareness: "💡 Optimal: Weekends have +30% better reach", 
    conversion: "💡 Optimal: Tuesday-Thursday show +40% conversions",
    default: "💡 Select a campaign type for optimization tips"
  };
  
  const currentOptimizationTip = formData.campaign_type 
    ? optimizationTips[formData.campaign_type as keyof typeof optimizationTips] || optimizationTips.default
    : optimizationTips.default;

  // All intelligence data is now loaded via useCampaignIntelligenceData hook

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
              <IntelligenceToggle 
                visible={intelligencePanelVisible}
                onToggle={setIntelligencePanelVisible}
              />
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-sm font-medium text-teal-600">Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm text-gray-600">Platforms</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm text-gray-600">Content</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <span className="text-sm text-gray-600">Launch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Intelligence & Setup</h2>
          <p className="text-gray-600">AI-powered insights to optimize your campaign strategy</p>
        </div>

        {/* Pre-fill Alert */}
        {searchParams?.get('source') === 'brand-health' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Smart Campaign Creation</h3>
                <p className="mt-1 text-sm text-blue-700">
                  We've pre-filled some details based on your brand health insights. You can modify or accept these suggestions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 gap-8 ${intelligencePanelVisible ? 'xl:grid-cols-2' : 'xl:grid-cols-1 max-w-4xl mx-auto'}`}>
          {/* Left Column - Intelligence Panels */}
          {intelligencePanelVisible && (
            <div className="space-y-6">
              {/* AI Suggested Actions */}
              {intelligenceInsights.length > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                      {intelligenceInsights[0].impact.toUpperCase()} PRIORITY
                    </Badge>
                    <span className="text-teal-600 text-sm">
                      {Math.round(intelligenceInsights[0].confidence * 100)}% Confidence
                    </span>
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">{intelligenceInsights[0].title}</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    {intelligenceInsights[0].description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Impact: <span className={`${
                        intelligenceInsights[0].impact === 'high' ? 'text-red-600' :
                        intelligenceInsights[0].impact === 'medium' ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {intelligenceInsights[0].impact}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Actionable: <span className="text-gray-900">
                        {intelligenceInsights[0].actionable ? 'Yes' : 'No'}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Trending Topics Panel */}
              <TrendingTopicsPanel
                topics={trendingTopics}
                isLoading={intelligenceLoading}
                onTopicSelect={(topic) => {
                  // Could integrate topic selection with campaign form
                  console.log('Selected topic:', topic);
                }}
              />

              {/* Competitor Intelligence Panel */}
              <CompetitorIntelligencePanel
                competitors={competitorIntelligence}
                isLoading={intelligenceLoading}
                onCompetitorSelect={(competitor) => {
                  // Could integrate competitor selection for deeper insights
                  console.log('Selected competitor:', competitor);
                }}
              />
            </div>
          )}

          {/* Right Column - Campaign Setup Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Campaign Setup</h3>
                <p className="text-gray-600">Campaign Name</p>
              </div>

              <div className="space-y-6">
                {/* Campaign Name */}
                <div>
                  <Label htmlFor="campaign_name" className="text-gray-900">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    value={formData.campaign_name}
                    onChange={(e) => handleFormChange('campaign_name', e.target.value)}
                    placeholder="Interactive Stories Boost"
                    className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${errors.campaign_name ? 'border-red-500' : ''}`}
                  />
                  {/* AI Suggestions */}
                  <div className="mt-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">💡 AI Suggestions:</span>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 bg-gray-100 text-gray-800">
                      Interactive Stories Boost
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 bg-gray-100 text-gray-800">
                      Engagement Master 2025
                    </Badge>
                  </div>
                  {errors.campaign_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.campaign_name}</p>
                  )}
                </div>

                {/* Campaign Type */}
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900">Campaign Type</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {campaignTypes.map(type => {
                      const IconComponent = type.IconComponent;
                      return (
                        <div
                          key={type.type}
                          className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            type.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-500 hover:bg-gray-50'
                          }`}
                          onClick={() => handleTypeSelection(type.type)}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                              type.type === 'engagement' ? 'bg-blue-600' :
                              type.type === 'awareness' ? 'bg-purple-600' : 'bg-green-600'
                            }`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{type.label}</h4>
                            <Badge className="mt-2 bg-green-500 text-white">
                              ROI: +{type.roi_percentage}%
                            </Badge>
                          </div>
                          {type.selected && <CheckCircle className="text-blue-500 mt-2 mx-auto" />}
                        </div>
                      );
                    })}
                  </div>
                  {errors.campaign_type && (
                    <p className="text-sm text-red-500 mt-1">{errors.campaign_type}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Description</h3>
                  <Textarea
                    rows={4}
                    value={formData.campaign_description}
                    onChange={(e) => handleFormChange('campaign_description', e.target.value)}
                    placeholder="Describe your campaign goals..."
                    className="resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-yellow-600">✨ AI Writing Assistant</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formData.campaign_description.length}/500
                    </span>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-gray-900">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.campaign_start_date}
                      onChange={(e) => handleFormChange('campaign_start_date', e.target.value)}
                      min={minDate}
                      max={maxDateString}
                      className={`bg-white border-gray-300 text-gray-900 ${errors.campaign_start_date ? 'border-red-500' : ''}`}
                    />
                    {errors.campaign_start_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.campaign_start_date}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="text-gray-900">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.campaign_end_date}
                      onChange={(e) => handleFormChange('campaign_end_date', e.target.value)}
                      min={formData.campaign_start_date || minDate}
                      max={maxDateString}
                      className={`bg-white border-gray-300 text-gray-900 ${errors.campaign_end_date ? 'border-red-500' : ''}`}
                    />
                    {errors.campaign_end_date && (
                      <p className="text-sm text-red-500 mt-1">{errors.campaign_end_date}</p>
                    )}
                  </div>
                </div>

                {/* Optimization Tip */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
                  <Lightbulb className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
                  <span className="text-yellow-800 text-sm">{currentOptimizationTip}</span>
                </div>

                {/* Budget */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-900">
                    Budget: {brandCurrency.currency_symbol} {formData.campaign_budget_allocated.toLocaleString()} {brandCurrency.currency_code}
                  </h3>
                  <Slider
                    value={[formData.campaign_budget_allocated]}
                    onValueChange={([value]) => handleFormChange('campaign_budget_allocated', value)}
                    min={0}
                    max={50000}
                    step={500}
                    className="mb-2"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{brandCurrency.currency_symbol} 0</span>
                    <span className="text-sm text-gray-600">{brandCurrency.currency_symbol} 50K+</span>
                  </div>
                </div>

                {/* Performance Predictions */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <span className="font-medium text-gray-900">
                      {formData.campaign_type && formData.campaign_budget_allocated > 0 ? 
                        `Predicted Performance: ${Math.round(formData.campaign_budget_allocated * 10 / 1000)}K-${Math.round(formData.campaign_budget_allocated * 16 / 1000)}K reach` :
                        'Predicted Performance: Configure type and budget'
                      }
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 text-sm">
                      🏆 Competitors avg: {
                        competitorIntelligence.length > 0 ? 
                        `${brandCurrency.currency_symbol} ${(competitorIntelligence.reduce((sum, c) => sum + c.avg_spend_raw, 0) / competitorIntelligence.length / 1000).toFixed(1)}K` :
                        'Loading...'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 mt-6 rounded-b-lg">
              <Button variant="outline" disabled>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || (!formData.campaign_name.trim() && !formData.campaign_type && !formData.campaign_description.trim())}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button 
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white"
                  disabled={!isStep1Complete || isSubmitting}
                  onClick={handleContinueToStep2}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving & Continuing...
                    </>
                  ) : (
                    <>
                      Continue to Step 2
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}