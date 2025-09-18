// apps/web/components/competitor-intelligence/TrendingTopicsPanel.tsx
"use client";

import React from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import type { TrendingTopic } from '@boastitup/types';
import { formatTrendVolume, useTrendingTopics } from '@boastitup/hooks/src/competitor-intelligence';
import { useBrandStore } from '../../store/brandStore';
import { Button } from '@boastitup/ui';

interface TrendingTopicsPanelProps {
  campaignId: string;
  onAddToAvailable: (hashtag: string, source: 'trending') => void;
  topics?: TrendingTopic[];
  isLoading?: boolean;
  onTopicSelect?: (topic: TrendingTopic) => void;
  className?: string;
}

const TrendingTopicsSkeletonLoader = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-200 rounded"></div>
            <div className="h-4 bg-orange-200 rounded w-24"></div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-green-200 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyTrendingTopicsState = () => (
  <div className="text-center py-6">
    <TrendingUp className="w-8 h-8 text-orange-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500 mb-1">No trending topics available</p>
    <p className="text-xs text-gray-400">Check back later for updates</p>
  </div>
);

const TrendingTopicItem: React.FC<{
  topic: TrendingTopic;
  onSelect?: (topic: TrendingTopic) => void;
  onAddToAvailable?: (hashtag: string, source: 'trending') => void;
  campaignId?: string;
}> = ({ topic, onSelect, onAddToAvailable, campaignId }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(topic);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToAvailable && (topic.hashtag_display || topic.trend_name)) {
      onAddToAvailable(topic.hashtag_display || topic.trend_name, 'trending');
    }
  };

  return (
    <div 
      className={`flex justify-between items-center py-2 px-1 border-b border-orange-100 last:border-b-0 rounded-md ${
        onSelect ? 'cursor-pointer hover:bg-orange-100/50 transition-colors duration-150' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0" title={`Growth: ${topic.growth_percentage.toFixed(0)}%`}>
          {topic.trending_indicator || '📈'}
        </span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-blue-600 text-sm truncate">
            {topic.hashtag_display || topic.trend_name}
          </span>
          {topic.primary_platform && (
            <span className="text-xs text-gray-500 capitalize">
              {topic.primary_platform}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className={`text-sm font-medium ${
              topic.growth_percentage > 30 ? 'text-green-600' :
              topic.growth_percentage > 15 ? 'text-orange-600' : 'text-gray-600'
            }`}>
              +{topic.growth_percentage.toFixed(0)}%
            </span>
            <div className="flex items-center justify-end gap-1 text-xs">
              <span className="text-gray-500">
                {formatTrendVolume(topic.volume)}
              </span>
              {topic.sentiment_score !== undefined && (
                <span className="text-gray-400">
                  {topic.sentiment_score > 0.3 ? '😊' : topic.sentiment_score < -0.3 ? '😕' : '😐'}
                </span>
              )}
            </div>
          </div>
        </div>
        {campaignId && onAddToAvailable && (
          <Button
            size="sm"
            variant="default"
            onClick={handleAddClick}
            className="h-8 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
            title="Add to available hashtags"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
};

export const TrendingTopicsPanel: React.FC<TrendingTopicsPanelProps> = ({
  campaignId,
  onAddToAvailable,
  topics: propTopics,
  isLoading: propIsLoading,
  onTopicSelect,
  className = ""
}) => {
  const { activeBrand } = useBrandStore();
  const { data: fetchedTopics = [], isLoading: fetchedIsLoading } = useTrendingTopics(activeBrand?.id);
  
  // Use fetched data if no props provided (as per change.txt specs)
  const topics = propTopics || fetchedTopics;
  const isLoading = propIsLoading !== undefined ? propIsLoading : fetchedIsLoading;
  if (isLoading) {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold mb-3 flex items-center text-gray-900">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
          Trending Topics
        </h3>
        <TrendingTopicsSkeletonLoader />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
        <h3 className="font-semibold mb-3 flex items-center text-gray-900">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
          Trending Topics
        </h3>
        <EmptyTrendingTopicsState />
      </div>
    );
  }

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold mb-4 flex items-center text-gray-900">
        <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
        Trending Topics
      </h3>
      
      <div className="space-y-1">
        {topics.slice(0, 8).map((topic) => (
          <TrendingTopicItem
            key={topic.id}
            topic={topic}
            onSelect={onTopicSelect}
            campaignId={campaignId}
            onAddToAvailable={onAddToAvailable}
          />
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-orange-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="text-xs text-gray-500">
          Data refreshed every 5 minutes
        </span>
        {topics.length > 8 && (
          <span className="text-xs text-orange-600 font-medium">
            +{topics.length - 8} more trends available
          </span>
        )}
      </div>
    </div>
  );
};