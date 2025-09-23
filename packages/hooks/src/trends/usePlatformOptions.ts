import { useQuery } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';

const supabase = createClient();

// Hook to get platform options from dim_platform
export const usePlatformOptions = () => {
  return useQuery({
    queryKey: ['platform-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dim_platform')
        .select('name, display_name, category')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data;
    },
  });
};