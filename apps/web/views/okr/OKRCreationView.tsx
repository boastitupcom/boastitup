"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Separator,
  IndustrySelector,
  OKRTemplateGrid,
  OKRCustomizationForm,
  BrandContextFormSimple,
  TemplateCard,
  BulkActionsToolbar,
  OKRSourceToggle
} from "@boastitup/ui";

import { 
  useDimensions, 
  useCreateOKR, 
  useBrandContext,
  useOKRTemplates
} from "../../lib/okr-hooks-provider";
import { useOKRSuggestions, OKRSourceType } from "@boastitup/hooks";
import {
  OKRTemplate,
  OKRCustomization,
  Industry,
  Platform,
  MetricType,
  DateDimension,
  CreateOKRInput
} from "../../types/okr-creation";

interface OKRCreationViewProps {
  initialIndustries?: Industry[];
  initialPlatforms?: Platform[];
  initialMetricTypes?: MetricType[];
  initialDates?: DateDimension[];
  brandId: string;
}

export function OKRCreationView({
  initialIndustries,
  initialPlatforms,
  initialMetricTypes,
  initialDates,
  brandId
}: OKRCreationViewProps) {
  // State management
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [customizations, setCustomizations] = useState<Map<string, OKRCustomization>>(new Map());
  const [activeStep, setActiveStep] = useState<'industry' | 'source' | 'ai_context' | 'templates' | 'customize' | 'review'>('industry');
  const [okrSource, setOKRSource] = useState<OKRSourceType>('ai');
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [showAIStep, setShowAIStep] = useState(false);

  const router = useRouter();

  // Hook usage
  const { brand, tenant, industry: brandIndustry, permissions } = useBrandContext(brandId);
  const { 
    industries, 
    platforms, 
    metricTypes, 
    dates, 
    isLoading: dimensionsLoading 
  } = useDimensions();
  
  const industrySlug = industries?.find(i => i.id === selectedIndustryId)?.slug || null;
  const { 
    templates, 
    isLoading: templatesLoading, 
    error: templatesError 
  } = useOKRTemplates(industrySlug);
  
  const { 
    createOKRs, 
    isCreating, 
    error: createError 
  } = useCreateOKR();

  // AI Suggestions hook
  const {
    generateSuggestions,
    suggestions,
    isLoading: isGeneratingAI,
    error: aiError,
    isHealthy: aiServiceHealthy
  } = useOKRSuggestions();

  // Use initial data or hook data
  const currentIndustries = industries || initialIndustries || [];
  const currentPlatforms = platforms || initialPlatforms || [];
  const currentMetricTypes = metricTypes || initialMetricTypes || [];
  const currentDates = dates || initialDates || [];

  // Use combined templates (AI suggestions + regular templates) - as per story.txt
  const combinedTemplates = [...(templates || []), ...suggestions];
  
  // Display templates based on selected source
  const displayTemplates = okrSource === 'ai' 
    ? [...suggestions, ...(templates || [])]  // AI suggestions first, then database as fallback
    : (templates || []);  // Database only
  
  // Fallback detection - if AI was attempted but source switched to database
  const hasFallenBack = okrSource === 'database' && suggestions.length === 0 && aiError;

  // Auto-select brand's industry if available
  useEffect(() => {
    if (brandIndustry && currentIndustries?.length > 0 && !selectedIndustryId) {
      setSelectedIndustryId(brandIndustry.id);
      setActiveStep('source'); // Progress to next step
    }
  }, [brandIndustry?.id, currentIndustries?.length]); // Removed selectedIndustryId to prevent loop

  // Simplified step progression - handle in event handlers instead of useEffect to prevent loops
  // Auto-select brand's industry if available

  // Handlers
  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustryId(industryId);
    setSelectedTemplateIds(new Set());
    setCustomizations(new Map());
    setAISuggestions([]);
    if (industryId) {
      setActiveStep('source');
    }
  };

  const handleSourceChange = (source: OKRSourceType) => {
    if (source === 'ai' && !aiServiceHealthy) {
      console.warn('Cannot switch to AI source: service is unhealthy, falling back to database');
      source = 'database';
    }
    
    setOKRSource(source);
    setSelectedTemplateIds(new Set());
    setCustomizations(new Map());
    
    if (source === 'ai' && aiServiceHealthy) {
      setActiveStep('ai_context');
      setShowAIStep(true);
    } else {
      setActiveStep('templates');
      setShowAIStep(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const newSelected = new Set(selectedTemplateIds);
    newSelected.add(templateId);
    setSelectedTemplateIds(newSelected);
    
    // Initialize customization for new template
    const template = displayTemplates.find(t => t.id === templateId);
    if (template && !customizations.has(templateId)) {
      const newCustomizations = new Map(customizations);
      newCustomizations.set(templateId, {
        templateId: templateId,
        title: template.title,
        targetValue: template.suggestedTargetValue,
        granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe
      });
      setCustomizations(newCustomizations);
    }
  };

  const handleTemplateDeselect = (templateId: string) => {
    const newSelected = new Set(selectedTemplateIds);
    newSelected.delete(templateId);
    setSelectedTemplateIds(newSelected);
    
    // Remove customization
    const newCustomizations = new Map(customizations);
    newCustomizations.delete(templateId);
    setCustomizations(newCustomizations);
  };

  const handleBulkSelect = (templateIds: string[]) => {
    setSelectedTemplateIds(new Set(templateIds));
    
    // Initialize customizations for all selected templates
    const newCustomizations = new Map();
    templateIds.forEach(templateId => {
      const template = displayTemplates.find(t => t.id === templateId);
      if (template) {
        newCustomizations.set(templateId, {
          templateId: templateId,
          title: template.title,
          targetValue: template.suggestedTargetValue,
          granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe
        });
      }
    });
    setCustomizations(newCustomizations);
  };

  const handleCustomizationChange = (templateId: string, data: Partial<OKRCustomization>) => {
    const newCustomizations = new Map(customizations);
    const existing = newCustomizations.get(templateId) || { templateId };
    newCustomizations.set(templateId, { ...existing, ...data });
    setCustomizations(newCustomizations);
  };

  const handleBulkCustomize = (data: Partial<OKRCustomization>) => {
    const newCustomizations = new Map(customizations);
    selectedTemplateIds.forEach(templateId => {
      const existing = newCustomizations.get(templateId) || { templateId };
      newCustomizations.set(templateId, { ...existing, ...data });
    });
    setCustomizations(newCustomizations);
    toast.success(`Applied settings to ${selectedTemplateIds.size} OKRs`);
  };

  // AI Context Enhancement handlers
  const handleAIContextSubmit = async (contextData: any) => {
    if (!brand || !tenant || !selectedIndustryId) {
      toast.error('Missing required brand or industry data');
      return;
    }

    try {
      const industry = currentIndustries.find(i => i.id === selectedIndustryId);
      const request = {
        industry: industry?.name || '',
        brandName: brand.name,
        tenantId: tenant.id,
        ...contextData
      };

      const result = await generateSuggestions(request);
      setAISuggestions(result.suggestions || []);
      
      toast.success(`Generated ${result.suggestions?.length || 0} AI-powered OKR suggestions!`);
      setActiveStep('templates');
      
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      toast.error('Failed to generate AI suggestions. Continuing with standard templates.');
      setActiveStep('templates');
    }
  };

  const handleAIContextSkip = () => {
    setActiveStep('templates');
  };

  const handleCreateOKRs = async () => {
    if (!brand || !tenant || selectedTemplateIds.size === 0) {
      toast.error('Missing required data for OKR creation');
      return;
    }

    try {
      const objectives = Array.from(selectedTemplateIds).map(templateId => {
        const template = combinedTemplates.find(t => t.id === templateId);
        const customization = customizations.get(templateId);
        
        if (!template || !customization) {
          throw new Error(`Missing template or customization for ${templateId}`);
        }

        return {
          title: customization.title || template.title,
          description: template.description,
          targetValue: customization.targetValue || template.suggestedTargetValue,
          targetDateId: customization.targetDateId || currentDates[30]?.id || 1, // Default to ~30 days out
          granularity: customization.granularity || 'monthly',
          metricTypeId: template.metricTypeId || currentMetricTypes[0]?.id,
          platformId: customization.platformId,
          okrMasterId: template.okrMasterId,
          priority: customization.priority || template.priority
        };
      });

      const input: CreateOKRInput = {
        tenantId: tenant.id,
        brandId: brand.id,
        objectives
      };

      await createOKRs(input);
      
      toast.success(`Successfully created ${objectives.length} OKRs!`);
      router.push('/workspace/okr/dashboard');

    } catch (error) {
      console.error('Failed to create OKRs:', error);
      toast.error('Failed to create OKRs. Please try again.');
    }
  };

  // Permission check
  if (permissions && !permissions.canCreateOKRs) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            You don't have permission to create OKRs for this brand. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedTemplates = combinedTemplates.filter(t => selectedTemplateIds.has(t.id)) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create OKRs</h1>
            <p className="text-gray-600 mt-2">
              Select and customize OKR templates for {brand?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/workspace/okr/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOKRs}
              disabled={isCreating || selectedTemplateIds.size === 0}
            >
              {isCreating ? 'Creating...' : 
               selectedTemplateIds.size > 0 ? `Create ${selectedTemplateIds.size} OKRs` : 'Create OKRs'
              }
            </Button>
          </div>
        </div>
        <Separator className="mt-6" />
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Industry Selection */}
        <div className="space-y-4">
          <Card className={activeStep === 'industry' ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">1</span>
                Select Industry
              </CardTitle>
              <CardDescription>
                Choose your industry to see relevant OKR templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndustrySelector
                industries={currentIndustries}
                selectedIndustryId={selectedIndustryId}
                onIndustryChange={handleIndustryChange}
                disabled={dimensionsLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Step 2: OKR Source Selection */}
        {selectedIndustryId && activeStep === 'source' && (
          <div className="lg:col-span-2 space-y-4">
            <Card className="ring-2 ring-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">2</span>
                  Choose OKR Source
                </CardTitle>
                <CardDescription>
                  Select whether to use AI-powered suggestions or curated database templates
                  {hasFallenBack && (
                    <span className="block mt-1 text-amber-600 font-medium">
                      ⚠️ Automatically switched to database due to AI service issues
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OKRSourceToggle
                  value={okrSource}
                  onValueChange={handleSourceChange}
                  variant="cards"
                  aiServiceHealthy={aiServiceHealthy}
                  aiError={aiError?.message || null}
                />
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Available templates: AI ({suggestions.length}), Database ({(templates || []).length})
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2.5: AI Context Enhancement (only show when AI source is selected) */}
        {showAIStep && selectedIndustryId && okrSource === 'ai' && (
          <div className="lg:col-span-2 space-y-4">
            <Card className={activeStep === 'ai_context' ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-green-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">🤖</span>
                  AI Context Enhancement
                  {!aiServiceHealthy && <span className="text-xs text-yellow-600">(Service Offline)</span>}
                </CardTitle>
                <CardDescription>
                  Provide additional context about your brand to get AI-powered OKR suggestions tailored to your specific needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiError && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      AI service error: {aiError.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <BrandContextFormSimple
                  brandName={brand?.name || ''}
                  industry={currentIndustries.find(i => i.id === selectedIndustryId)?.name || ''}
                  onSubmit={handleAIContextSubmit}
                  onSkip={handleAIContextSkip}
                  isLoading={isGeneratingAI}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Template Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className={activeStep === 'templates' ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">3</span>
                Select Templates
                <span className="text-xs text-muted-foreground ml-2">
                  ({okrSource === 'ai' ? 'AI-Powered' : 'Database'})
                </span>
              </CardTitle>
              <CardDescription>
                Choose OKR templates to customize for your goals
                {selectedTemplateIds.size === 0 && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    ⚠️ Select at least one template to create OKRs
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesError && (
                <Alert className="mb-4">
                  <AlertDescription>
                    {templatesError.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Show AI suggestions if available */}
              {aiSuggestions.length > 0 && okrSource === 'ai' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                    🤖 AI-Powered Suggestions ({aiSuggestions.length})
                  </h3>
                  <div className="grid gap-6 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {aiSuggestions.slice(0, 4).map(suggestion => (
                      <TemplateCard
                        key={suggestion.id}
                        template={suggestion}
                        isSelected={selectedTemplateIds.has(suggestion.id)}
                        onSelect={() => handleTemplateSelect(suggestion.id)}
                        onDeselect={() => handleTemplateDeselect(suggestion.id)}
                        className="border-green-200 bg-green-50"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <OKRTemplateGrid
                templates={displayTemplates}
                selectedTemplateIds={selectedTemplateIds}
                onTemplateSelect={handleTemplateSelect}
                onTemplateDeselect={handleTemplateDeselect}
                onBulkSelect={handleBulkSelect}
                isLoading={templatesLoading || isGeneratingAI}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step 4: Customization - Only show when templates are selected */}
      {selectedTemplateIds.size > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">4</span>
            <h2 className="text-xl font-semibold">Customize Your OKRs</h2>
          </div>

          {/* Bulk Actions */}
          <BulkActionsToolbar
            selectedCount={selectedTemplateIds.size}
            onSelectAll={() => handleBulkSelect(displayTemplates.map(t => t.id))}
            onDeselectAll={() => handleBulkSelect([])}
            onBulkCustomize={handleBulkCustomize}
            disabled={isCreating}
          />

          {/* Individual Customization Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedTemplates.map(template => {
              const customization = customizations.get(template.id) || { templateId: template.id };
              
              return (
                <OKRCustomizationForm
                  key={template.id}
                  template={template}
                  customization={customization}
                  onCustomizationChange={(data) => handleCustomizationChange(template.id, data)}
                  platforms={currentPlatforms}
                  metricTypes={currentMetricTypes}
                  dates={currentDates}
                />
              );
            })}
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              onClick={handleCreateOKRs}
              disabled={isCreating || selectedTemplateIds.size === 0}
              className="px-8"
            >
              {isCreating ? 'Creating OKRs...' : `Create ${selectedTemplateIds.size} OKRs`}
            </Button>
          </div>
        </div>
      )}

      {createError && (
        <Alert className="mt-4">
          <AlertDescription>
            {createError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}