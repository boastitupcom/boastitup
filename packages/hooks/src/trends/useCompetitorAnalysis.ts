import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

// Hook to get competitor analysis data
export const useCompetitorAnalysis = (brandId: string, productId?: string) => {
  return useQuery({
    queryKey: ['competitor-analysis', brandId, productId],
    queryFn: async () => {
      let query = supabase
        .from('brand_competitors')
        .select(`
          *,
          competitors!brand_competitors_competitor_id_fkey(
            id,
            brand_name,
            industry_id
          )
        `)
        .eq('brand_id', brandId);

      // Note: Product-level competitor tracking will be added when brand_competitors
      // table is updated with product_id as mentioned in story.txt

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });
};