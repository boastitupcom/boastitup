"use client";

import React from 'react';
import { Badge } from '@boastitup/ui';
import type { CampaignPlatform } from '@boastitup/types';

interface PlatformSelectorProps {
  selectedPlatforms?: CampaignPlatform[];
  onPlatformSelect: (platforms: CampaignPlatform[]) => void;
  budget?: number;
  allowMultiPlatform?: boolean;
  className?: string;
}

const platformConfig: Record<CampaignPlatform, {
  label: string;
  icon: string;
  color: string;
  selectedColor: string;
}> = {
  instagram: {
    label: 'Instagram',
    icon: '📷',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-pink-300',
    selectedColor: 'bg-pink-50 border-pink-500 text-pink-700'
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
    selectedColor: 'bg-gray-50 border-gray-500 text-gray-700'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
    selectedColor: 'bg-blue-50 border-blue-500 text-blue-700'
  },
  twitter: {
    label: 'Twitter',
    icon: '🐦',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
    selectedColor: 'bg-blue-50 border-blue-400 text-blue-600'
  },
  facebook: {
    label: 'Facebook',
    icon: '👥',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
    selectedColor: 'bg-blue-50 border-blue-600 text-blue-700'
  },
  google_ads: {
    label: 'Google Ads',
    icon: '🔍',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-green-300',
    selectedColor: 'bg-green-50 border-green-500 text-green-700'
  },
  pinterest: {
    label: 'Pinterest',
    icon: '📌',
    color: 'bg-white border-gray-200 text-gray-700 hover:border-red-300',
    selectedColor: 'bg-red-50 border-red-500 text-red-700'
  }
};

const platforms: CampaignPlatform[] = [
  'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook'
];

const MULTI_PLATFORM_MIN_BUDGET = 10000;

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms = [],
  onPlatformSelect,
  budget = 0,
  allowMultiPlatform = false,
  className = ""
}) => {
  const canSelectMultiple = allowMultiPlatform && budget >= MULTI_PLATFORM_MIN_BUDGET;

  const handlePlatformClick = (platform: CampaignPlatform) => {
    if (!canSelectMultiple) {
      // Single platform mode - always replace selection
      onPlatformSelect([platform]);
      return;
    }

    // Multi-platform mode - toggle selection
    const isSelected = selectedPlatforms.includes(platform);
    if (isSelected) {
      // Don't allow deselecting if it's the only one selected
      if (selectedPlatforms.length > 1) {
        onPlatformSelect(selectedPlatforms.filter(p => p !== platform));
      }
    } else {
      onPlatformSelect([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Select Platform</h4>
        {allowMultiPlatform && budget >= MULTI_PLATFORM_MIN_BUDGET && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Multi-platform enabled
          </Badge>
        )}
        {allowMultiPlatform && budget < MULTI_PLATFORM_MIN_BUDGET && budget > 0 && (
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            Multi-platform requires ${MULTI_PLATFORM_MIN_BUDGET.toLocaleString()}+ budget
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {platforms.map((platform) => {
          const config = platformConfig[platform];
          const isSelected = selectedPlatforms.includes(platform);

          return (
            <button
              key={platform}
              onClick={() => handlePlatformClick(platform)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all hover:shadow-sm ${
                isSelected ? config.selectedColor : config.color
              }`}
            >
              <span className="text-lg">{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>

      {!canSelectMultiple && (
        <p className="text-xs text-gray-500">
          {allowMultiPlatform
            ? `Select one platform. Increase budget to $${MULTI_PLATFORM_MIN_BUDGET.toLocaleString()} or more to enable multi-platform campaigns.`
            : "Select one platform for this campaign."
          }
        </p>
      )}
    </div>
  );
};