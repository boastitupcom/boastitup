"use client";

import React from 'react';
import { Hash, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Badge } from '@boastitup/ui';
import { useCampaignAvailableHashtags } from '@boastitup/hooks/src/campaigns/useCampaignHashtags';

interface HashtagAvailablePanelProps {
  campaignId: string;
  onSelectHashtag: (hashtag: string) => void;
  selectedHashtags: string[];
}

const HashtagAvailableSkeletonLoader = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="animate-pulse">
        <div className="flex justify-between items-center p-2 bg-blue-100 rounded-md">
          <div className="h-4 bg-blue-200 rounded w-20"></div>
          <div className="h-6 bg-blue-300 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyAvailableHashtagsState = () => (
  <div className="text-center py-8">
    <Hash className="w-12 h-12 text-blue-300 mx-auto mb-3" />
    <p className="text-sm text-gray-600 mb-1">No hashtags available</p>
    <p className="text-xs text-gray-500">Add trending topics to build your hashtag pool</p>
  </div>
);

const HashtagItem: React.FC<{
  hashtag: string;
  source: 'trending' | 'manual' | 'suggested';
  isSelected: boolean;
  onSelect: (hashtag: string) => void;
}> = ({ hashtag, source, isSelected, onSelect }) => {
  const handleSelectClick = () => {
    if (!isSelected) {
      onSelect(hashtag);
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'trending': return 'bg-orange-100 text-orange-700';
      case 'manual': return 'bg-gray-100 text-gray-700';
      case 'suggested': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${
      isSelected 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-sm'
    }`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Badge 
          variant="secondary" 
          className={`text-xs px-2 py-1 ${getSourceColor(source)} border-0`}
        >
          {source}
        </Badge>
        <span className={`font-mono text-sm ${
          isSelected ? 'text-gray-500' : 'text-blue-600'
        }`}>
          #{hashtag}
        </span>
      </div>
      
      <div className="flex-shrink-0 ml-2">
        {isSelected ? (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <CheckCircle className="w-4 h-4" />
            Selected
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelectClick}
            className="h-8 px-3 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 text-xs"
            title="Select for campaign"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Select
          </Button>
        )}
      </div>
    </div>
  );
};

export const HashtagAvailablePanel: React.FC<HashtagAvailablePanelProps> = ({
  campaignId,
  onSelectHashtag,
  selectedHashtags
}) => {
  const { data: availableHashtags = [], isLoading } = useCampaignAvailableHashtags(campaignId);

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center text-gray-900">
          <Hash className="w-5 h-5 mr-2 text-blue-600" />
          Available Hashtags
        </h3>
        <HashtagAvailableSkeletonLoader />
      </div>
    );
  }

  if (availableHashtags.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center text-gray-900">
          <Hash className="w-5 h-5 mr-2 text-blue-600" />
          Available Hashtags
        </h3>
        <EmptyAvailableHashtagsState />
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold mb-4 flex items-center text-gray-900">
        <Hash className="w-5 h-5 mr-2 text-blue-600" />
        Available Hashtags
        <span className="ml-2 text-xs font-normal text-gray-600">
          ({availableHashtags.length})
        </span>
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {availableHashtags.map((item) => (
          <HashtagItem
            key={item.id}
            hashtag={item.hashtag}
            source={item.source}
            isSelected={selectedHashtags.includes(item.hashtag)}
            onSelect={onSelectHashtag}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between items-center text-xs text-gray-500">
        <span>Pool for this campaign</span>
        <span>{availableHashtags.filter(h => !selectedHashtags.includes(h.hashtag)).length} available to select</span>
      </div>
    </div>
  );
};