"use client";

import { useState, useCallback, useEffect } from 'react';
import { useOKRSuggestions } from '../api/use-okr-suggestions';

export type OKRSourceType = 'ai' | 'database';

interface OKRTemplate {
  id: string;
  okrMasterId: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  suggestedTargetValue: number;
  suggestedTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  applicablePlatforms: string[];
  metricTypeId: string;
  confidenceScore: number;
  reasoning?: string;
  source: 'ai' | 'database';
}

interface DatabaseTemplatesService {
  fetchTemplates: (industrySlug?: string) => Promise<OKRTemplate[]>;
}

interface UseOKRSourceManagerProps {
  industrySlug?: string | null;
  databaseService?: DatabaseTemplatesService;
  autoFallback?: boolean; // Whether to automatically fallback to database when AI fails
}

interface BrandContext {
  industry: string;
  brandName: string;
  tenantId: string;
  keyProduct?: string;
  productCategory?: string;
  keyCompetition?: string[];
  majorKeywords?: string[];
  objective?: string;
  historicalOKRs?: string[];
}

/**
 * Enhanced hook that manages OKR sources with AI/Database fallback logic
 * Provides a unified interface for both AI suggestions and database templates
 */
export function useOKRSourceManager({
  industrySlug = null,
  databaseService,
  autoFallback = true
}: UseOKRSourceManagerProps) {
  const [selectedSource, setSelectedSource] = useState<OKRSourceType>('ai');
  const [databaseTemplates, setDatabaseTemplates] = useState<OKRTemplate[]>([]);
  const [combinedTemplates, setCombinedTemplates] = useState<OKRTemplate[]>([]);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);
  const [databaseError, setDatabaseError] = useState<Error | null>(null);
  const [hasTriedAI, setHasTriedAI] = useState(false);

  // AI suggestions hook
  const {
    generateSuggestions,
    suggestions: aiSuggestions,
    isLoading: isGeneratingAI,
    error: aiError,
    isHealthy: aiServiceHealthy,
    clearSuggestions
  } = useOKRSuggestions();

  // Load database templates
  const loadDatabaseTemplates = useCallback(async () => {
    if (!databaseService || !industrySlug) return;
    
    setIsLoadingDatabase(true);
    setDatabaseError(null);
    
    try {
      const templates = await databaseService.fetchTemplates(industrySlug);
      const templatesWithSource = templates.map(template => ({
        ...template,
        source: 'database' as const
      }));
      setDatabaseTemplates(templatesWithSource);
    } catch (error) {
      console.error('Failed to load database templates:', error);
      setDatabaseError(error instanceof Error ? error : new Error('Failed to load templates'));
    } finally {
      setIsLoadingDatabase(false);
    }
  }, [databaseService, industrySlug]); // Ensure industrySlug is always defined

  // Auto-fallback handled in switchSource function instead of useEffect to prevent loops

  // Load database templates when industry changes
  useEffect(() => {
    loadDatabaseTemplates();
  }, [loadDatabaseTemplates]);

  // Update combined templates when sources change
  useEffect(() => {
    const aiTemplatesWithSource = aiSuggestions.map(template => ({
      ...template,
      source: 'ai' as const
    }));

    if (selectedSource === 'ai') {
      setCombinedTemplates([...aiTemplatesWithSource, ...databaseTemplates]);
    } else {
      setCombinedTemplates([...databaseTemplates]);
    }
  }, [aiSuggestions, databaseTemplates, selectedSource]);

  // Generate AI suggestions with fallback
  const generateAISuggestions = useCallback(async (brandContext: BrandContext) => {
    setHasTriedAI(true);
    
    try {
      const result = await generateSuggestions(brandContext);
      return result;
    } catch (error) {
      console.error('AI suggestions failed:', error);
      
      // Auto-fallback to database if enabled
      if (autoFallback) {
        console.log('Falling back to database templates due to AI failure');
        setSelectedSource('database');
      }
      
      throw error;
    }
  }, [generateSuggestions, autoFallback]);

  // Switch source manually
  const switchSource = useCallback((source: OKRSourceType) => {
    if (source === 'ai' && !aiServiceHealthy) {
      console.warn('Cannot switch to AI source: service is unhealthy');
      if (autoFallback) {
        console.log('Auto-falling back to database');
        setSelectedSource('database');
        return true;
      }
      return false;
    }
    
    setSelectedSource(source);
    
    // Clear AI suggestions if switching to database only
    if (source === 'database') {
      clearSuggestions();
    }
    
    return true;
  }, [aiServiceHealthy, clearSuggestions, autoFallback]);

  // Retry AI suggestions
  const retryAISuggestions = useCallback(async (brandContext: BrandContext) => {
    if (!aiServiceHealthy) {
      throw new Error('AI service is currently unavailable');
    }
    
    return generateAISuggestions(brandContext);
  }, [aiServiceHealthy, generateAISuggestions]);

  // Get templates for current source
  const getTemplatesForSource = useCallback((source?: OKRSourceType) => {
    const sourceToUse = source || selectedSource;
    
    if (sourceToUse === 'ai') {
      return aiSuggestions.map(template => ({ ...template, source: 'ai' as const }));
    } else {
      return databaseTemplates;
    }
  }, [selectedSource, aiSuggestions, databaseTemplates]);

  // Check if source is available
  const isSourceAvailable = useCallback((source: OKRSourceType) => {
    if (source === 'ai') {
      return aiServiceHealthy;
    } else {
      return databaseTemplates.length > 0 || !databaseError;
    }
  }, [aiServiceHealthy, databaseTemplates.length, databaseError]);

  return {
    // Source management
    selectedSource,
    switchSource,
    isSourceAvailable,
    
    // Templates
    templates: combinedTemplates,
    aiTemplates: aiSuggestions.map(t => ({ ...t, source: 'ai' as const })),
    databaseTemplates,
    getTemplatesForSource,
    
    // AI specific
    generateAISuggestions,
    retryAISuggestions,
    hasTriedAI,
    isGeneratingAI,
    aiError,
    aiServiceHealthy,
    clearAISuggestions: clearSuggestions,
    
    // Database specific
    isLoadingDatabase,
    databaseError,
    reloadDatabaseTemplates: loadDatabaseTemplates,
    
    // Combined state
    isLoading: isGeneratingAI || isLoadingDatabase,
    hasError: !!(aiError && selectedSource === 'ai') || !!(databaseError && selectedSource === 'database'),
    error: selectedSource === 'ai' ? aiError : databaseError,
    
    // Fallback info
    autoFallback,
    hasFallenBack: autoFallback && selectedSource === 'database' && hasTriedAI,
    
    // Statistics
    stats: {
      totalTemplates: combinedTemplates.length,
      aiTemplates: aiSuggestions.length,
      databaseTemplates: databaseTemplates.length,
      selectedSourceCount: getTemplatesForSource().length
    }
  };
}

export type UseOKRSourceManagerReturn = ReturnType<typeof useOKRSourceManager>;