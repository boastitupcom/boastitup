// packages/hooks/src/use-analytics.ts
import { useState, useEffect } from 'react';
import { AnalyticsData } from '@boastitup/types';

export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from Supabase. For now, use dummy data.
        const dummyData: AnalyticsData = {
          kpis: [
            { title: 'Social Engagement', value: '8,427', change: '+12.3%' },
            { title: 'Conversion Rate', value: '2.8%', change: '-0.2%' },
            { title: 'Ad Spend ROI', value: '3.2x', change: '+0.5x' },
            { title: 'Growth Efficiency Score', value: '78', change: '+4 pts' }
          ],
          marketPulse: [
            { type: 'search_trends', item: 'Electrolyte Powder', change: '+35%' },
            { type: 'search_trends', item: 'Collagen Peptides', change: '+80%' },
            { type: 'audience_shifts', item: 'Natural Ingredients', change: '+95%' },
          ],
          growthLevers: [
            { name: 'Instagram Organic', status: 'Active', change: '+15%' },
            { name: 'WhatsApp Groups', status: 'Active', change: '+12%' },
            { name: 'Google Search', status: 'Active', change: '+8%' },
          ],
          opportunityRadar: [
            { title: '3 Supplement Stacks Outperforming Pre-Workouts', score: 'Virality Score: 4.6/5' },
            { title: 'Why Indian Fitness Athletes Are Switching to Electrolytes', score: 'Virality Score: 4.0/5' },
            { title: 'Protein + Creatine + BCAA Trial Pack', score: 'Predicted Impact: +24%' },
          ],
          benchmarks: {
            labels: ['Organic Traffic', 'Conversion Rate', 'Retention', 'Social Engagement'],
            current: [18, 2.8, 65, 3.2],
            previous: [12, 2.5, 58, 2.7]
          }
        };
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setData(dummyData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};