"use client";

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

// Types from story.txt lines 294-329
interface OKRSuggestionRequest {
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
}

interface OKRSuggestionResponse {
  suggestions: OKRTemplate[];
  metadata: {
    industry: string;
    brandContext: string;
    generatedAt: string;
    confidence: number;
  };
}

interface UseOKRSuggestionsOptions {
  apiBaseUrl?: string;
  enabled?: boolean;
}

/**
 * Hook for integrating with Express.js AI suggestion service
 * Follows story.txt API specifications lines 290-329
 */
export function useOKRSuggestions(options: UseOKRSuggestionsOptions = {}) {
  const { 
    apiBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002',
    enabled = true 
  } = options;

  const [lastRequest, setLastRequest] = useState<OKRSuggestionRequest | null>(null);

  /**
   * Health check for AI service - TEMPORARILY DISABLED
   */
  // const { data: healthStatus, isLoading: isHealthLoading } = useQuery({
  //   queryKey: ['okr-suggestions-health'],
  //   queryFn: async () => {
  //     const response = await fetch(`${apiBaseUrl}/api/okr-suggestions/health`);
  //     if (!response.ok) {
  //       throw new Error('AI service health check failed');
  //     }
  //     return response.json();
  //   },
  //   enabled,
  //   staleTime: 60000, // 1 minute
  //   retry: 2,
  //   retryDelay: 1000
  // });
  const healthStatus = null;
  const isHealthLoading = false;

  /**
   * Generate AI-powered OKR suggestions
   */
  const suggestionsMutation = useMutation({
    mutationFn: async (request: OKRSuggestionRequest): Promise<OKRSuggestionResponse> => {
      console.log('🤖 Requesting AI suggestions:', request);
      
      const response = await fetch(`${apiBaseUrl}/api/okr-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `HTTP ${response.status}: Failed to generate suggestions`
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      return data.data;
    },
    onSuccess: (data, variables) => {
      setLastRequest(variables);
      console.log('✅ AI suggestions generated:', data.suggestions.length, 'suggestions');
    },
    onError: (error) => {
      console.error('❌ Failed to generate AI suggestions:', error);
    }
  });

  /**
   * Generate suggestions with enhanced context
   */
  const generateSuggestions = useCallback(
    async (request: OKRSuggestionRequest) => {
      // Validate required fields
      if (!request.industry || !request.brandName || !request.tenantId) {
        throw new Error('Industry, brand name, and tenant ID are required');
      }

      try {
        const result = await suggestionsMutation.mutateAsync(request);
        return result;
      } catch (error) {
        // Enhanced error handling
        if (error instanceof Error) {
          if (error.message.includes('rate limit')) {
            throw new Error('Too many requests. Please wait a moment before trying again.');
          } else if (error.message.includes('network')) {
            throw new Error('Unable to connect to AI service. Please check your connection.');
          } else if (error.message.includes('timeout')) {
            throw new Error('Request timed out. The AI service may be busy. Please try again.');
          }
        }
        throw error;
      }
    },
    [suggestionsMutation]
  );

  /**
   * Regenerate suggestions with same parameters
   */
  const regenerateSuggestions = useCallback(async () => {
    if (!lastRequest) {
      throw new Error('No previous request to regenerate');
    }
    return generateSuggestions(lastRequest);
  }, [lastRequest, generateSuggestions]);

  /**
   * Clear suggestions and reset state
   */
  const clearSuggestions = useCallback(() => {
    suggestionsMutation.reset();
    setLastRequest(null);
  }, [suggestionsMutation]);

  return {
    // Data
    suggestions: suggestionsMutation.data?.suggestions || [],
    metadata: suggestionsMutation.data?.metadata || null,
    lastRequest,
    
    // State
    isLoading: suggestionsMutation.isPending,
    isError: suggestionsMutation.isError,
    error: suggestionsMutation.error,
    
    // Health - TEMPORARILY DISABLED
    isHealthy: true, // healthStatus?.status === 'healthy',
    isHealthLoading: false, // isHealthLoading,
    healthStatus: null, // healthStatus,
    
    // Actions
    generateSuggestions,
    regenerateSuggestions,
    clearSuggestions,
    
    // Utilities
    canRegenerate: !!lastRequest && !suggestionsMutation.isPending,
    hasResults: !!suggestionsMutation.data?.suggestions?.length,
    
    // Raw mutation for advanced usage
    mutation: suggestionsMutation
  };
}

/**
 * Lightweight hook for just checking AI service health - TEMPORARILY DISABLED
 */
export function useAIServiceHealth(apiBaseUrl?: string) {
  // const baseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002';
  
  // return useQuery({
  //   queryKey: ['ai-service-health', baseUrl],
  //   queryFn: async () => {
  //     const response = await fetch(`${baseUrl}/health`);
  //     if (!response.ok) {
  //       throw new Error(`Service unhealthy: ${response.status}`);
  //     }
  //     return response.json();
  //   },
  //   staleTime: 30000, // 30 seconds
  //   refetchInterval: 60000, // 1 minute
  //   retry: 1
  // });
  
  return {
    data: { status: 'healthy', timestamp: new Date().toISOString() },
    isLoading: false,
    isError: false,
    error: null
  };
}