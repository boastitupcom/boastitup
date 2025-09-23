"use client";

import React from 'react';
import { Button, Badge } from '@boastitup/ui';
import { Plus, Minus } from 'lucide-react';

interface HashtagData {
  id: string;
  hashtag: string;
  volume: number;
  growth_percentage: number;
  competition_level: 'low' | 'medium' | 'high';
  performance_level: 'low' | 'medium' | 'high';
}

interface HashtagPerformanceMatrixProps {
  hashtags: HashtagData[];
  onAddHashtag: (hashtag: string) => void;
  onRemoveHashtag: (hashtag: string) => void;
  addedHashtags: string[];
  className?: string;
}

const getQuadrant = (competition: string, performance: string) => {
  if (competition === 'low' && performance === 'high') return 'golden';
  if (competition === 'high' && performance === 'high') return 'competitive';
  if (competition === 'low' && performance === 'low') return 'niche';
  return 'avoid';
};

const quadrantConfig = {
  golden: {
    title: 'Golden Opportunity',
    subtitle: 'Low competition, high performance',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-700'
  },
  competitive: {
    title: 'Competitive Battlefield',
    subtitle: 'High competition, high performance',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-700'
  },
  niche: {
    title: 'Niche Exploration',
    subtitle: 'Low competition, low performance',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  avoid: {
    title: 'Avoid Zone',
    subtitle: 'High competition, low performance',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-700'
  }
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
  return volume.toString();
};

export const HashtagPerformanceMatrix: React.FC<HashtagPerformanceMatrixProps> = ({
  hashtags,
  onAddHashtag,
  onRemoveHashtag,
  addedHashtags,
  className = ""
}) => {
  // Group hashtags by quadrant
  const quadrants = {
    golden: hashtags.filter(h => getQuadrant(h.competition_level, h.performance_level) === 'golden'),
    competitive: hashtags.filter(h => getQuadrant(h.competition_level, h.performance_level) === 'competitive'),
    niche: hashtags.filter(h => getQuadrant(h.competition_level, h.performance_level) === 'niche'),
    avoid: hashtags.filter(h => getQuadrant(h.competition_level, h.performance_level) === 'avoid')
  };

  const renderQuadrant = (quadrantKey: keyof typeof quadrants, hashtags: HashtagData[]) => {
    const config = quadrantConfig[quadrantKey];

    return (
      <div
        key={quadrantKey}
        className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6 min-h-[300px]`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-semibold ${config.textColor} text-lg flex items-center`}>
              <span className="mr-2">
                {quadrantKey === 'golden' && '●'}
                {quadrantKey === 'competitive' && '●'}
                {quadrantKey === 'niche' && '●'}
                {quadrantKey === 'avoid' && '●'}
              </span>
              {config.title}
            </h3>
            <p className="text-sm text-gray-600">{config.subtitle}</p>
          </div>
        </div>

        <div className="space-y-3">
          {hashtags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No hashtags in this category</p>
            </div>
          ) : (
            hashtags.map((hashtag) => {
              const isAdded = addedHashtags.includes(hashtag.hashtag);

              return (
                <div
                  key={hashtag.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{hashtag.hashtag}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-sm font-medium">
                        {hashtag.growth_percentage > 0 ? '+' : ''}{hashtag.growth_percentage}%
                      </span>
                      <Button
                        size="sm"
                        variant={isAdded ? "destructive" : "default"}
                        onClick={() => isAdded ? onRemoveHashtag(hashtag.hashtag) : onAddHashtag(hashtag.hashtag)}
                        className={`h-8 w-8 p-0 ${
                          isAdded
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                        }`}
                      >
                        {isAdded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      <span className="text-gray-500">Vol: </span>
                      <span className="font-medium">{formatVolume(hashtag.volume)}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.badgeColor} border-0`}
                      >
                        {hashtag.competition_level} comp
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 text-sm">?</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Hashtag Performance Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderQuadrant('golden', quadrants.golden)}
        {renderQuadrant('competitive', quadrants.competitive)}
        {renderQuadrant('niche', quadrants.niche)}
        {renderQuadrant('avoid', quadrants.avoid)}
      </div>
    </div>
  );
};