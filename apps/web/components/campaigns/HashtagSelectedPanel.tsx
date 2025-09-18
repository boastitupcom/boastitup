"use client";

import React from 'react';
import { Target, X, Hash as HashIcon } from 'lucide-react';
import { Button, Badge } from '@boastitup/ui';

interface HashtagSelectedPanelProps {
  campaignId: string;
  selectedHashtags: string[];
  onRemoveHashtag: (hashtag: string) => void;
  onReorderHashtags: (hashtags: string[]) => void;
}

const HashtagSelectedSkeletonLoader = () => (
  <div className="space-y-2">
    {[1, 2].map(i => (
      <div key={i} className="animate-pulse">
        <div className="flex justify-between items-center p-2 bg-green-100 rounded-md">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-green-200 rounded w-4"></div>
            <div className="h-4 bg-green-200 rounded w-20"></div>
          </div>
          <div className="h-6 bg-green-300 rounded w-6"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptySelectedHashtagsState = () => (
  <div className="text-center py-8">
    <Target className="w-12 h-12 text-green-300 mx-auto mb-3" />
    <p className="text-sm text-gray-600 mb-1">No hashtags selected</p>
    <p className="text-xs text-gray-500">Select hashtags from available pool</p>
  </div>
);

const SelectedHashtagItem: React.FC<{
  hashtag: string;
  index: number;
  onRemove: (hashtag: string) => void;
}> = ({ hashtag, index, onRemove }) => {
  const handleRemoveClick = () => {
    onRemove(hashtag);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-md border border-green-200 hover:border-green-300 transition-colors duration-200">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-xs text-gray-500 font-mono w-6">
          #{index + 1}
        </span>
        <Badge 
          variant="outline" 
          className="text-green-700 border-green-300 bg-green-50 font-mono text-sm px-2 py-1"
        >
          #{hashtag}
        </Badge>
      </div>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleRemoveClick}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 text-gray-400"
        title="Remove from selection"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const HashtagSelectedPanel: React.FC<HashtagSelectedPanelProps> = ({
  campaignId,
  selectedHashtags,
  onRemoveHashtag,
  onReorderHashtags
}) => {

  const maxHashtags = 30;
  const currentCount = selectedHashtags.length;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold mb-4 flex items-center justify-between text-gray-900">
        <div className="flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Selected for Campaign
        </div>
        <span className={`text-sm font-normal ${
          currentCount >= maxHashtags ? 'text-red-600' : 'text-gray-600'
        }`}>
          {currentCount}/{maxHashtags}
        </span>
      </h3>
      
      {selectedHashtags.length === 0 ? (
        <EmptySelectedHashtagsState />
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedHashtags.map((hashtag, index) => (
              <SelectedHashtagItem
                key={hashtag}
                hashtag={hashtag}
                index={index}
                onRemove={onRemoveHashtag}
              />
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-green-200">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>Final campaign hashtags</span>
              <span className={currentCount >= maxHashtags ? 'text-red-600' : 'text-green-600'}>
                {maxHashtags - currentCount} remaining
              </span>
            </div>
            
            {currentCount >= maxHashtags && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                <HashIcon className="w-3 h-3" />
                <span>Maximum hashtag limit reached</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};