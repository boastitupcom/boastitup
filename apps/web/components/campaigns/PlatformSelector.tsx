"use client";

import React from 'react';
import type { CampaignPlatform } from '@boastitup/types';

interface PlatformSelectorProps {
  selectedPlatform?: CampaignPlatform;
  onPlatformSelect: (platform: CampaignPlatform) => void;
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
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-pink-50 border-pink-500 text-pink-700'
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-gray-50 border-gray-500 text-gray-700'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-blue-50 border-blue-500 text-blue-700'
  },
  twitter: {
    label: 'Twitter',
    icon: '🐦',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-blue-50 border-blue-400 text-blue-600'
  },
  facebook: {
    label: 'Facebook',
    icon: '👥',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-blue-50 border-blue-600 text-blue-700'
  },
  google_ads: {
    label: 'Google Ads',
    icon: '🔍',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-green-50 border-green-500 text-green-700'
  },
  pinterest: {
    label: 'Pinterest',
    icon: '📌',
    color: 'bg-white border-gray-200 text-gray-700',
    selectedColor: 'bg-red-50 border-red-500 text-red-700'
  }
};

// Match the platforms from @lo.png
const platforms: CampaignPlatform[] = [
  'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook'
];

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onPlatformSelect,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">Select Platforms</h4>
      <div className="flex items-center gap-2">
        {platforms.map((platform) => {
          const config = platformConfig[platform];
          const isSelected = selectedPlatform === platform;

          return (
            <button
              key={platform}
              onClick={() => onPlatformSelect(platform)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-all hover:shadow-sm ${
                isSelected ? config.selectedColor : config.color
              }`}
            >
              <span className="text-base">{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};