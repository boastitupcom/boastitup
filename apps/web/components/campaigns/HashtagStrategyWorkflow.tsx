"use client";

import React from 'react';
import { toast } from 'sonner';
import { TrendingTopicsPanel } from '../competitor-intelligence/TrendingTopicsPanel';
import { HashtagAvailablePanel } from './HashtagAvailablePanel';
import { HashtagSelectedPanel } from './HashtagSelectedPanel';
import {
  useAddHashtagToAvailable,
  useSelectHashtagForCampaign,
  useRemoveSelectedHashtag,
  useCampaignSelectedHashtags,
  useReorderSelectedHashtags
} from '@boastitup/hooks/src/campaigns/useCampaignHashtags';

interface HashtagStrategyWorkflowProps {
  campaignId: string;
}

export const HashtagStrategyWorkflow: React.FC<HashtagStrategyWorkflowProps> = ({
  campaignId
}) => {
  const addToAvailable = useAddHashtagToAvailable();
  const selectHashtag = useSelectHashtagForCampaign();
  const removeSelected = useRemoveSelectedHashtag();
  const reorderHashtags = useReorderSelectedHashtags();

  const { data: selectedHashtags = [] } = useCampaignSelectedHashtags(campaignId);

  const handleAddToAvailable = async (hashtag: string, source: 'trending') => {
    try {
      await addToAvailable.mutateAsync({ campaignId, hashtag, source });
      toast.success(`#${hashtag} added to available hashtags`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.info(`#${hashtag} is already in your hashtag pool`);
      } else {
        toast.error(`Failed to add #${hashtag} to available hashtags`);
      }
    }
  };

  const handleSelectHashtag = async (hashtag: string) => {
    try {
      await selectHashtag.mutateAsync({ campaignId, hashtag });
      toast.success(`#${hashtag} selected for campaign`);
    } catch (error) {
      toast.error(`Failed to select #${hashtag} for campaign`);
    }
  };

  const handleRemoveHashtag = async (hashtag: string) => {
    try {
      await removeSelected.mutateAsync({ campaignId, hashtag });
      toast.success(`#${hashtag} removed from campaign selection`);
    } catch (error) {
      toast.error(`Failed to remove #${hashtag} from selection`);
    }
  };

  const handleReorderHashtags = async (hashtags: string[]) => {
    try {
      await reorderHashtags.mutateAsync({ campaignId, hashtags });
      toast.success('Hashtag order updated');
    } catch (error) {
      toast.error('Failed to reorder hashtags');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hashtag Strategy</h2>
        <p className="text-gray-600 text-sm">
          Discover trending topics, build your hashtag pool, and select the perfect hashtags for your campaign
        </p>
      </div>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel: Trending Topics */}
        <div className="space-y-4">
          <TrendingTopicsPanel 
            campaignId={campaignId}
            onAddToAvailable={handleAddToAvailable}
          />
        </div>

        {/* Center Panel: Available Hashtags */}
        <div className="space-y-4">
          <HashtagAvailablePanel 
            campaignId={campaignId}
            onSelectHashtag={handleSelectHashtag}
            selectedHashtags={selectedHashtags.map(h => h.hashtag)}
          />
        </div>

        {/* Right Panel: Selected Hashtags */}
        <div className="space-y-4">
          <HashtagSelectedPanel 
            campaignId={campaignId}
            selectedHashtags={selectedHashtags.map(h => h.hashtag)}
            onRemoveHashtag={handleRemoveHashtag}
            onReorderHashtags={handleReorderHashtags}
          />
        </div>
      </div>

      {/* Flow Indicators for mobile */}
      <div className="xl:hidden">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-orange-400 rounded-full mr-1"></span>
            Trending
          </span>
          <span>→</span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-blue-400 rounded-full mr-1"></span>
            Available
          </span>
          <span>→</span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-1"></span>
            Selected
          </span>
        </div>
      </div>
    </div>
  );
};