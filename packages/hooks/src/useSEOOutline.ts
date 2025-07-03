import { useState, useCallback } from 'react';

interface OutlineRequest {
  topic: string;
  focusKeyword: string;
  targetAudience?: string;
}

interface GenerationInfo {
  timestamp: string;
  topic: string;
  focus_keyword: string;
  target_audience: string;
  status: string;
  [key: string]: any;
}

interface OutlineResponse {
  headline: string;
  meta_description: string;
  introduction: any;
  main_sections: any[];
  conclusion: any;
  seo_optimization: any;
  generation_info: GenerationInfo;
  [key: string]: any;
}

interface UseSEOOutlineReturn {
  outline: OutlineResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchOutline: (params: OutlineRequest) => void;
}

export const useSEOOutline = (): UseSEOOutlineReturn => {
  const [outline, setOutline] = useState<OutlineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOutline = useCallback(async ({ topic, focusKeyword, targetAudience }: OutlineRequest) => {
    setIsLoading(true);
    setError(null);
    setOutline(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          focus_keyword: focusKeyword,
          target_audience: targetAudience || 'general audience'
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch outline');
      }

      const data: OutlineResponse = await response.json();
      setOutline(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    outline,
    isLoading,
    error,
    fetchOutline
  };
};