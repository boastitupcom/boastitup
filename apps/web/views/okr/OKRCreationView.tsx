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
  OKRSourceToggle,
  Progress,
  Badge
} from "@boastitup/ui";
import { ChevronLeft, ChevronRight, CheckCircle, Target, Brain, Database, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [okrSource, setOKRSource] = useState<OKRSourceType>('database');
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [showAIStep, setShowAIStep] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
  
  const selectedIndustry = industries?.find(i => i.id === selectedIndustryId);
  
  // Enhanced industry slug resolution with validation (Task 5 from tasks.md)
  const industrySlug = React.useMemo(() => {
    const selected = selectedIndustry?.slug;
    const brandDefault = brandIndustry?.slug;
    const resolved = selected || brandDefault || null;
    
    // Validate slug format consistency
    if (resolved && !/^[a-z0-9-]+$/.test(resolved)) {
      console.warn(`[OKRCreationView] ⚠️ Invalid industry slug format: "${resolved}"`);
    }
    
    return resolved;
  }, [selectedIndustry?.slug, brandIndustry?.slug]);
  
  // Enhanced logging for industry slug resolution and templates result
  React.useEffect(() => {
    console.log('[OKRCreationView] 🔍 Industry slug resolution:', {
      selectedIndustryId,
      selectedIndustry: selectedIndustry ? { id: selectedIndustry.id, name: selectedIndustry.name, slug: selectedIndustry.slug } : null,
      brandIndustry: brandIndustry ? { id: brandIndustry.id, name: brandIndustry.name, slug: brandIndustry.slug } : null,
      finalIndustrySlug: industrySlug,
      resolutionMethod: selectedIndustry?.slug ? 'selected' : brandIndustry?.slug ? 'brand' : 'fallback_to_all',
      availableIndustries: industries?.length || 0,
      industriesSample: industries?.slice(0, 3).map(i => ({ name: i.name, slug: i.slug })) || []
    });
  }, [selectedIndustryId, selectedIndustry, brandIndustry, industrySlug, industries]);
  
  const { 
    data: templates, 
    isLoading: templatesLoading, 
    error: templatesError 
  } = useOKRTemplates(industrySlug);

  // Enhanced templates result logging (Task 5 from tasks.md)
  React.useEffect(() => {
    console.log('[OKRCreationView] 📊 Templates hook result:', {
      industrySlug,
      templatesCount: templates?.length || 0,
      isLoading: templatesLoading,
      hasError: !!templatesError,
      errorMessage: templatesError?.message,
      firstTemplateTitle: templates?.[0]?.title,
      templateIndustries: templates?.slice(0, 5).map(t => ({
        title: t.title,
        industry: t.reasoning?.split(' ')[2] || 'unknown'
      })) || [],
      uniqueIndustries: [...new Set(templates?.map(t => t.reasoning?.split(' ')[2]) || [])]
    });
  }, [industrySlug, templates, templatesLoading, templatesError]);
  
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

  // Define wizard steps
  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Get started with OKR creation' },
    { id: 'industry', title: 'Industry', description: 'Select your industry' },
    { id: 'source', title: 'Source', description: 'Choose OKR source' },
    ...(showAIStep ? [{ id: 'ai_context', title: 'AI Context', description: 'Enhance with AI' }] : []),
    { id: 'templates', title: 'Templates', description: 'Select templates' },
    { id: 'customize', title: 'Customize', description: 'Customize your OKRs' },
    { id: 'review', title: 'Review', description: 'Review and create' }
  ];

  // Auto-select brand's industry if available
  useEffect(() => {
    if (brandIndustry && currentIndustries?.length > 0 && !selectedIndustryId) {
      setSelectedIndustryId(brandIndustry.id);
      markStepCompleted(1);
      if (currentStep === 1) {
        handleNextStep();
      }
    }
  }, [brandIndustry?.id, currentIndustries?.length]);

  // Step navigation helpers
  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const canProceedToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return isStepCompleted(stepIndex - 1);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsAnimating(false);
      }, 150);
    }
  };

  // Handlers
  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustryId(industryId);
    setSelectedTemplateIds(new Set());
    setCustomizations(new Map());
    setAISuggestions([]);
    if (industryId) {
      markStepCompleted(1);
      handleNextStep();
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
      setShowAIStep(true);
    } else {
      setShowAIStep(false);
    }
    
    markStepCompleted(2);
    handleNextStep();
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
      markStepCompleted(showAIStep ? 3 : 2);
      handleNextStep();
      
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      toast.error('Failed to generate AI suggestions. Continuing with standard templates.');
      markStepCompleted(showAIStep ? 3 : 2);
      handleNextStep();
    }
  };

  const handleAIContextSkip = () => {
    markStepCompleted(showAIStep ? 3 : 2);
    handleNextStep();
  };

  const handleTemplateSelectionComplete = () => {
    if (selectedTemplateIds.size === 0) {
      toast.error('Please select at least one template to continue');
      return;
    }
    const templateStepIndex = showAIStep ? 4 : 3;
    markStepCompleted(templateStepIndex);
    handleNextStep();
  };

  const handleCustomizationComplete = () => {
    const customizeStepIndex = showAIStep ? 5 : 4;
    markStepCompleted(customizeStepIndex);
    handleNextStep();
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
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Step component renderers
  const renderWelcomeStep = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center max-w-2xl mx-auto space-y-8"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Create Your OKRs</h1>
        <p className="text-xl text-gray-600">
          Let's set up objectives and key results for {brand?.name} in just a few simple steps
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 rounded-lg bg-blue-50 border border-blue-200">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold">1</span>
          </div>
          <h3 className="font-semibold text-gray-900">Choose Industry</h3>
          <p className="text-sm text-gray-600 mt-2">Select your business industry for relevant templates</p>
        </div>
        
        <div className="text-center p-6 rounded-lg bg-green-50 border border-green-200">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">AI or Templates</h3>
          <p className="text-sm text-gray-600 mt-2">Get AI suggestions or choose from our template library</p>
        </div>
        
        <div className="text-center p-6 rounded-lg bg-purple-50 border border-purple-200">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Customize</h3>
          <p className="text-sm text-gray-600 mt-2">Tailor your OKRs to match your specific goals</p>
        </div>
      </div>
      
      <div className="mt-8">
        <Button size="lg" onClick={handleNextStep} className="px-8">
          Get Started
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/workspace/okr/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">OKR Creation Wizard</h1>
                <p className="text-sm text-gray-600">{brand?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <div className="text-sm text-gray-600 font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isCompleted = isStepCompleted(index);
                const isCurrent = currentStep === index;
                const canAccess = canProceedToStep(index);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!canAccess}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : canAccess
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {!isAnimating && (
            <div key={currentStep}>
              {currentStep === 0 && renderWelcomeStep()}
              {currentStep === 1 && renderIndustryStep()}
              {currentStep === 2 && renderSourceStep()}
              {showAIStep && currentStep === 3 && renderAIContextStep()}
              {currentStep === (showAIStep ? 4 : 3) && renderTemplatesStep()}
              {currentStep === (showAIStep ? 5 : 4) && renderCustomizeStep()}
              {currentStep === (showAIStep ? 6 : 5) && renderReviewStep()}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation Footer */}
      {currentStep > 0 && (
        <div className="bg-white border-t sticky bottom-0 z-10">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-sm text-gray-600">
                {currentStepData.description}
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleCreateOKRs}
                    disabled={isCreating || selectedTemplateIds.size === 0}
                    size="lg"
                  >
                    {isCreating ? 'Creating OKRs...' : `Create ${selectedTemplateIds.size} OKRs`}
                  </Button>
                ) : (
                  <Button onClick={handleNextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {createError && (
        <Alert className="mx-4 mb-4 max-w-6xl mx-auto">
          <AlertDescription>
            {createError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Step component functions
  function renderIndustryStep() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Industry</h2>
          <p className="text-lg text-gray-600">
            Choose your business industry to see the most relevant OKR templates
          </p>
        </div>
        
        <Card className="p-6">
          <IndustrySelector
            industries={currentIndustries}
            selectedIndustryId={selectedIndustryId}
            onIndustryChange={handleIndustryChange}
            disabled={dimensionsLoading}
          />
        </Card>
      </motion.div>
    );
  }

  function renderSourceStep() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your OKR Source</h2>
          <p className="text-lg text-gray-600">
            Select how you'd like to create your OKRs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={`p-6 cursor-pointer border-2 transition-all hover:border-blue-300 ${
              okrSource === 'ai' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleSourceChange('ai')}
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Suggestions</h3>
                <p className="text-gray-600 mt-2">
                  Get personalized OKR recommendations based on your brand context and industry
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={aiServiceHealthy ? 'default' : 'secondary'}>
                  {aiServiceHealthy ? 'Available' : 'Service Offline'}
                </Badge>
                {suggestions.length > 0 && (
                  <Badge variant="outline">
                    {suggestions.length} suggestions ready
                  </Badge>
                )}
              </div>
            </div>
          </Card>
          
          <Card 
            className={`p-6 cursor-pointer border-2 transition-all hover:border-green-300 ${
              okrSource === 'database' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
            onClick={() => handleSourceChange('database')}
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Template Library</h3>
                <p className="text-gray-600 mt-2">
                  Browse our curated collection of proven OKR templates for your industry
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="default">
                  Always Available
                </Badge>
                {(templates || []).length > 0 && (
                  <Badge variant="outline">
                    {(templates || []).length} templates
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  }

  function renderAIContextStep() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Enhance with AI Context</h2>
          <p className="text-lg text-gray-600">
            Provide more details about your brand to get highly personalized OKR suggestions
          </p>
        </div>
        
        <Card className="p-6">
          {aiError && (
            <Alert className="mb-6">
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
        </Card>
      </motion.div>
    );
  }

  function renderTemplatesStep() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Templates</h2>
          <p className="text-lg text-gray-600">
            Choose the OKR templates you'd like to customize for your goals
          </p>
          {selectedTemplateIds.size > 0 && (
            <Badge variant="secondary" className="mt-2">
              {selectedTemplateIds.size} template{selectedTemplateIds.size !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>
        
        <div className="space-y-6">
          {templatesError && (
            <Alert>
              <AlertDescription>
                {templatesError.message}
              </AlertDescription>
            </Alert>
          )}
          
          {/* AI Suggestions Section */}
          {aiSuggestions.length > 0 && okrSource === 'ai' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Suggestions</h3>
                <Badge variant="secondary">{aiSuggestions.length} suggestions</Badge>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {aiSuggestions.slice(0, 6).map(suggestion => (
                  <TemplateCard
                    key={suggestion.id}
                    template={suggestion}
                    isSelected={selectedTemplateIds.has(suggestion.id)}
                    onSelect={() => handleTemplateSelect(suggestion.id)}
                    onDeselect={() => handleTemplateDeselect(suggestion.id)}
                    className="border-blue-200 bg-blue-50"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Database Templates */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Template Library</h3>
              {(templates || []).length > 0 && (
                <Badge variant="secondary">{(templates || []).length} templates</Badge>
              )}
            </div>
            <OKRTemplateGrid
              templates={displayTemplates}
              selectedTemplateIds={selectedTemplateIds}
              onTemplateSelect={handleTemplateSelect}
              onTemplateDeselect={handleTemplateDeselect}
              onBulkSelect={handleBulkSelect}
              isLoading={templatesLoading || isGeneratingAI}
              error={templatesError}
            />
          </div>
          
          {selectedTemplateIds.size > 0 && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleTemplateSelectionComplete} size="lg">
                Continue with {selectedTemplateIds.size} template{selectedTemplateIds.size !== 1 ? 's' : ''}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  function renderCustomizeStep() {
    if (selectedTemplates.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center"
        >
          <Alert>
            <AlertDescription>
              No templates selected. Please go back and select templates first.
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    const currentTemplate = selectedTemplates[currentTemplateIndex];
    const customization = customizations.get(currentTemplate.id) || { templateId: currentTemplate.id };
    const isLastTemplate = currentTemplateIndex === selectedTemplates.length - 1;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Customize Your OKRs</h2>
          <p className="text-lg text-gray-600">
            Customize template {currentTemplateIndex + 1} of {selectedTemplates.length}
          </p>
          <Progress value={((currentTemplateIndex + 1) / selectedTemplates.length) * 100} className="mt-4" />
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentTemplate.title}</h3>
              <p className="text-gray-600">{currentTemplate.description}</p>
            </div>
            <Badge variant="outline">
              {currentTemplateIndex + 1} of {selectedTemplates.length}
            </Badge>
          </div>
          
          <OKRCustomizationForm
            template={currentTemplate}
            customization={customization}
            onCustomizationChange={(data) => handleCustomizationChange(currentTemplate.id, data)}
            platforms={currentPlatforms}
            metricTypes={currentMetricTypes}
            dates={currentDates}
          />
          
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentTemplateIndex(prev => Math.max(0, prev - 1))}
              disabled={currentTemplateIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Template
            </Button>
            
            <div className="flex items-center gap-2">
              {selectedTemplates.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentTemplateIndex ? 'bg-blue-600' : 
                    index < currentTemplateIndex ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {isLastTemplate ? (
              <Button onClick={handleCustomizationComplete}>
                Complete Customization
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => setCurrentTemplateIndex(prev => Math.min(selectedTemplates.length - 1, prev + 1))}>
                Next Template
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  function renderReviewStep() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Create</h2>
          <p className="text-lg text-gray-600">
            Review your OKR selections and customizations before creating
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedTemplateIds.size}</div>
                <div className="text-sm text-gray-600">OKRs to Create</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentIndustries.find(i => i.id === selectedIndustryId)?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Industry</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {okrSource === 'ai' ? 'AI-Powered' : 'Template Library'}
                </div>
                <div className="text-sm text-gray-600">Source</div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h4 className="font-semibold text-gray-900 mb-4">Selected OKRs:</h4>
            <div className="space-y-3">
              {selectedTemplates.map(template => {
                const customization = customizations.get(template.id);
                return (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {customization?.title || template.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {customization?.targetValue || template.suggestedTargetValue} • 
                        {customization?.granularity || template.suggestedTimeframe}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {template.category || 'OKR'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
          
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleCreateOKRs}
              disabled={isCreating || selectedTemplateIds.size === 0}
              className="px-8"
            >
              {isCreating ? (
                <>Creating Your OKRs...</>
              ) : (
                <>Create {selectedTemplateIds.size} OKR{selectedTemplateIds.size !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
}