import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

export interface BrandProduct {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  sku?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useBrandProducts = (brandId: string) => {
  return useQuery({
    queryKey: ['brand-products', brandId],
    queryFn: async (): Promise<BrandProduct[]> => {
      if (!brandId) return [];

      try {
        const { data, error } = await supabase
          .from('brand_products')
          .select('*')
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching brand products:', error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error('Network error fetching brand products:', err);
        return [];
      }
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};