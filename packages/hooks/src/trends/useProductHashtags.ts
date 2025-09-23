import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

// Hook to get product-specific hashtags
export const useProductHashtags = (brandId: string, productId?: string) => {
  return useQuery({
    queryKey: ['product-hashtags', brandId, productId],
    queryFn: async () => {
      if (!productId || productId === 'all') return [];

      const { data, error } = await supabase
        .from('v_trending_topics_view')
        .select('related_hashtags')
        .eq('brand_id', brandId)
        .eq('product_id', productId)
        .not('related_hashtags', 'is', null);

      if (error) throw error;

      // Flatten and deduplicate hashtags
      const allHashtags = data.flatMap(item => item.related_hashtags || []);
      return [...new Set(allHashtags)];
    },
    enabled: !!brandId && !!productId && productId !== 'all',
  });
};