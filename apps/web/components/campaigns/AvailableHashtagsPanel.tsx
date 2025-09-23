"use client";

import React, { useState } from 'react';
import { Input, Button } from '@boastitup/ui';
import { Search, Plus, Minus } from 'lucide-react';

interface AvailableHashtag {
  id: string;
  hashtag: string;
  source: 'trending' | 'product' | 'manual';
  volume?: number;
  growth_percentage?: number;
  added_at: string;
}

interface AvailableHashtagsPanelProps {
  hashtags: AvailableHashtag[];
  onSelectHashtag: (hashtag: string) => void;
  onAddCustomHashtag: (hashtag: string) => void;
  onRemoveHashtag?: (hashtag: string) => void;
  selectedHashtags: string[];
  isLoading?: boolean;
  className?: string;
}

const formatVolume = (volume?: number): string => {
  if (!volume) return 'N/A';
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
  return volume.toString();
};

export const AvailableHashtagsPanel: React.FC<AvailableHashtagsPanelProps> = ({
  hashtags,
  onSelectHashtag,
  onAddCustomHashtag,
  onRemoveHashtag,
  selectedHashtags,
  isLoading = false,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customHashtag, setCustomHashtag] = useState('');

  const filteredHashtags = hashtags.filter(hashtag =>
    hashtag.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustom = () => {
    if (customHashtag.trim()) {
      const formattedHashtag = customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`;
      onAddCustomHashtag(formattedHashtag);
      setCustomHashtag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustom();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Available Hashtags Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Available Hashtags</h3>
        <span className="text-sm text-gray-500">{hashtags.length} available</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Custom Hashtag */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add custom hashtag..."
          value={customHashtag}
          onChange={(e) => setCustomHashtag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleAddCustom}
          disabled={!customHashtag.trim()}
          size="sm"
          className="px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty State */}
      {hashtags.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm">No hashtags available yet</p>
          <p className="text-gray-400 text-xs mt-1">Add hashtags from trending topics or create custom ones</p>
        </div>
      )}

      {/* Available Hashtags List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredHashtags.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <p className="text-gray-500 text-sm">No hashtags found matching "{searchTerm}"</p>
            ) : (
              <p className="text-gray-500 text-sm">No hashtags available yet</p>
            )}
          </div>
        ) : (
          filteredHashtags.map((hashtag) => {
            const isSelected = selectedHashtags.includes(hashtag.hashtag);

            return (
              <div
                key={hashtag.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onSelectHashtag(hashtag.hashtag)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {hashtag.hashtag}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {hashtag.growth_percentage !== undefined && (
                      <span className="text-green-600 text-sm font-medium">
                        {hashtag.growth_percentage > 0 ? '+' : ''}{hashtag.growth_percentage}%
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      hashtag.source === 'trending' ? 'bg-green-100 text-green-700' :
                      hashtag.source === 'product' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {hashtag.source}
                    </span>
                    {hashtag.source === 'manual' && onRemoveHashtag && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveHashtag(hashtag.hashtag);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    <span className="text-gray-500">Volume: </span>
                    <span className="font-medium">{formatVolume(hashtag.volume)}</span>
                  </span>
                  <span className="text-gray-500">
                    Added {new Date(hashtag.added_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};