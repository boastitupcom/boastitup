import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@boastitup/supabase/client';
import { useBrandStore } from '../../../../apps/web/store/brandStore';

const supabase = createClient();

export interface CampaignHashtag {
  id: string;
  tenant_id: string;
  brand_id: string;
  campaign_id: string;
  hashtag: string;
  status: 'available' | 'selected';
  source: 'trending' | 'manual' | 'suggested';
  position?: number;
  added_at: string;
  selected_at?: string;
}

// Campaign-specific available hashtags
export const useCampaignAvailableHashtags = (campaignId: string) => {
  const { activeBrand } = useBrandStore();

  return useQuery({
    queryKey: ['campaign-hashtags-available', campaignId],
    queryFn: async () => {
      if (!activeBrand?.id || !campaignId) return [];

      const { data, error } = await supabase
        .from('campaign_hashtags')
        .select('id, tenant_id, brand_id, campaign_id, hashtag, status, source, position, added_at, selected_at')
        .eq('campaign_id', campaignId)
        .eq('status', 'available')
        .eq('brand_id', activeBrand.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data as CampaignHashtag[];
    },
    enabled: !!activeBrand?.id && !!campaignId
  });
};

// Campaign-specific selected hashtags
export const useCampaignSelectedHashtags = (campaignId: string) => {
  const { activeBrand } = useBrandStore();

  return useQuery({
    queryKey: ['campaign-hashtags-selected', campaignId],
    queryFn: async () => {
      if (!activeBrand?.id || !campaignId) return [];

      const { data, error } = await supabase
        .from('campaign_hashtags')
        .select('id, tenant_id, brand_id, campaign_id, hashtag, status, source, position, added_at, selected_at')
        .eq('campaign_id', campaignId)
        .eq('status', 'selected')
        .eq('brand_id', activeBrand.id)
        .order('position', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as CampaignHashtag[];
    },
    enabled: !!activeBrand?.id && !!campaignId
  });
};

// Add hashtag to available pool
export const useAddHashtagToAvailable = () => {
  const queryClient = useQueryClient();
  const { activeBrand } = useBrandStore();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      hashtag, 
      source 
    }: {
      campaignId: string;
      hashtag: string;
      source: 'trending' | 'manual' | 'suggested';
    }) => {
      if (!activeBrand?.id) throw new Error('No active brand');

      // Check if hashtag already exists for this campaign
      const { data: existing } = await supabase
        .from('campaign_hashtags')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('hashtag', hashtag)
        .eq('brand_id', activeBrand.id)
        .single();

      if (existing) {
        throw new Error('Hashtag already exists for this campaign');
      }

      const { data, error } = await supabase
        .from('campaign_hashtags')
        .insert({
          campaign_id: campaignId,
          brand_id: activeBrand.id,
          tenant_id: activeBrand.tenant_id,
          hashtag,
          source,
          status: 'available'
        })
        .select('id, tenant_id, brand_id, campaign_id, hashtag, status, source, position, added_at, selected_at');

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-available', campaignId] });
    }
  });
};

// Select hashtag for campaign (move from available to selected)
export const useSelectHashtagForCampaign = () => {
  const queryClient = useQueryClient();
  const { activeBrand } = useBrandStore();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      hashtag 
    }: {
      campaignId: string;
      hashtag: string;
    }) => {
      if (!activeBrand?.id) throw new Error('No active brand');

      // Get current position count for selected hashtags
      const { count } = await supabase
        .from('campaign_hashtags')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'selected')
        .eq('brand_id', activeBrand.id);

      const nextPosition = (count || 0) + 1;

      const { data, error } = await supabase
        .from('campaign_hashtags')
        .update({
          status: 'selected',
          position: nextPosition,
          selected_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('hashtag', hashtag)
        .eq('brand_id', activeBrand.id)
        .eq('status', 'available')
        .select('id, tenant_id, brand_id, campaign_id, hashtag, status, source, position, added_at, selected_at');

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-available', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-selected', campaignId] });
    }
  });
};

// Remove hashtag from selected (move back to available or delete)
export const useRemoveSelectedHashtag = () => {
  const queryClient = useQueryClient();
  const { activeBrand } = useBrandStore();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      hashtag 
    }: {
      campaignId: string;
      hashtag: string;
    }) => {
      if (!activeBrand?.id) throw new Error('No active brand');

      const { data, error } = await supabase
        .from('campaign_hashtags')
        .update({
          status: 'available',
          position: null,
          selected_at: null
        })
        .eq('campaign_id', campaignId)
        .eq('hashtag', hashtag)
        .eq('brand_id', activeBrand.id)
        .eq('status', 'selected')
        .select('id, tenant_id, brand_id, campaign_id, hashtag, status, source, position, added_at, selected_at');

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-available', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-selected', campaignId] });
    }
  });
};

// Reorder selected hashtags
export const useReorderSelectedHashtags = () => {
  const queryClient = useQueryClient();
  const { activeBrand } = useBrandStore();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      hashtags 
    }: {
      campaignId: string;
      hashtags: string[];
    }) => {
      if (!activeBrand?.id) throw new Error('No active brand');

      // Update positions for all hashtags
      const updates = hashtags.map((hashtag, index) => ({
        campaign_id: campaignId,
        hashtag,
        position: index + 1
      }));

      const promises = updates.map(({ hashtag, position }) =>
        supabase
          .from('campaign_hashtags')
          .update({ position })
          .eq('campaign_id', campaignId)
          .eq('hashtag', hashtag)
          .eq('brand_id', activeBrand.id)
          .eq('status', 'selected')
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to reorder some hashtags');
      }

      return results;
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-hashtags-selected', campaignId] });
    }
  });
};