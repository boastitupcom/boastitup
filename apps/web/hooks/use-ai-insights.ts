import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { AIInsight, UseAIInsightsReturn } from '../types/okr';

export function useAIInsights(): UseAIInsightsReturn {
  const [insights, setInsights] = useState<AIInsight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('v_ai_insights_enriched')
        .select('*');

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Data is ready to use as-is from the view
      setInsights(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch AI insights'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const acknowledgeInsight = useCallback(async (insightTitle: string) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_insights')
        .update({ is_acknowledged: true })
        .eq('insight_title', insightTitle);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refresh insights after acknowledgment
      await fetchInsights();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to acknowledge insight'));
    }
  }, [supabase, fetchInsights]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    error,
    acknowledgeInsight,
  };
}