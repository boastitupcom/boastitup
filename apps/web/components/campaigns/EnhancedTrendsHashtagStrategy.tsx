"use client";

import React, { useState, useEffect } from 'react';
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@boastitup/ui";
import { toast } from "sonner";
import { useBrandStore } from "../../store/brandStore";
import {
  useTrendingTopicsWithPlatformFilter,
  useBrandProducts,
  useCampaignAvailableHashtags,
  useCampaignSelectedHashtags,
  useAddHashtagToAvailable,
  useSelectHashtagForCampaign,
  useRemoveSelectedHashtag,
  useRemoveHashtagFromAvailable,
  useHashtagPerformanceMatrix
} from "@boastitup/hooks";
import { PlatformSelector } from "./PlatformSelector";
import { HashtagPerformanceMatrix } from "./HashtagPerformanceMatrix";
import { AvailableHashtagsPanel } from "./AvailableHashtagsPanel";
import { SelectedHashtagsPanel } from "./SelectedHashtagsPanel";
import type { CampaignPlatform } from "@boastitup/types";

interface EnhancedTrendsHashtagStrategyProps {
  campaignId: string;
  selectedProductId?: string;
  budget?: number;
  onPlatformChange?: (platform: CampaignPlatform) => void;
}

const EnhancedTrendsHashtagStrategy: React.FC<EnhancedTrendsHashtagStrategyProps> = ({
  campaignId,
  selectedProductId,
  budget = 0,
  onPlatformChange
}) => {
  const { activeBrand } = useBrandStore();
  const [selectedPlatforms, setSelectedPlatforms] = useState<CampaignPlatform[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>(selectedProductId || 'all');

  const handlePlatformSelect = (platforms: CampaignPlatform[]) => {
    setSelectedPlatforms(platforms);
    // Pass single platform to parent as specified in story.txt "Only One platform at time"
    onPlatformChange?.(platforms[0]);
  };

  // Update product when prop changes
  useEffect(() => {
    if (selectedProductId) {
      setSelectedProduct(selectedProductId);
    }
  }, [selectedProductId]);

  // Data hooks
  const { data: brandProducts = [], isLoading: productsLoading } = useBrandProducts(activeBrand?.id || '');

  // Get hashtag performance matrix data
  const { data: matrixHashtags = [], isLoading: matrixLoading } = useHashtagPerformanceMatrix(
    activeBrand?.id || '',
    selectedPlatforms.length > 0 ? selectedPlatforms[0] : undefined,
    selectedProduct
  );

  // Hashtag management hooks
  const { data: availableHashtags = [], isLoading: availableLoading, refetch: refetchAvailable } = useCampaignAvailableHashtags(campaignId);
  const { data: selectedHashtags = [], isLoading: selectedLoading, refetch: refetchSelected } = useCampaignSelectedHashtags(campaignId);
  const addToAvailable = useAddHashtagToAvailable();
  const selectHashtag = useSelectHashtagForCampaign();
  const removeSelected = useRemoveSelectedHashtag();
  const removeFromAvailable = useRemoveHashtagFromAvailable();

  // Hashtag actions
  const handleAddToAvailable = async (hashtag: string) => {
    try {
      await addToAvailable.mutateAsync({
        campaignId,
        hashtag,
        source: 'trending'
      });
      toast.success(`${hashtag} added to available hashtags`);
      refetchAvailable();
    } catch (error) {
      toast.error('Failed to add hashtag');
    }
  };

  const handleAddCustomHashtag = async (hashtag: string) => {
    try {
      await addToAvailable.mutateAsync({
        campaignId,
        hashtag,
        source: 'manual'
      });
      toast.success(`${hashtag} added to available hashtags`);
      refetchAvailable();
    } catch (error) {
      toast.error('Failed to add custom hashtag');
    }
  };

  const handleSelectHashtag = async (hashtag: string) => {
    try {
      await selectHashtag.mutateAsync({ campaignId, hashtag });
      toast.success(`${hashtag} selected for campaign`);
      refetchSelected();
      refetchAvailable();
    } catch (error) {
      toast.error('Failed to select hashtag');
    }
  };

  const handleRemoveSelected = async (hashtag: string) => {
    try {
      await removeSelected.mutateAsync({ campaignId, hashtag });
      toast.success(`${hashtag} removed from selection`);
      refetchSelected();
      refetchAvailable();
    } catch (error) {
      toast.error('Failed to remove hashtag');
    }
  };

  const handleRemoveFromAvailable = async (hashtag: string) => {
    try {
      await removeFromAvailable.mutateAsync({ campaignId, hashtag });
      toast.success(`${hashtag} removed from available hashtags`);
      refetchAvailable();
      refetchSelected();
    } catch (error) {
      toast.error('Failed to remove hashtag');
    }
  };

  // Transform available hashtags data for the panel
  const availableHashtagsData = availableHashtags.map(h => ({
    id: h.id,
    hashtag: h.hashtag,
    source: h.source as 'trending' | 'product' | 'manual',
    volume: undefined, // Would come from trends data
    growth_percentage: undefined,
    added_at: h.added_at
  }));

  // Transform selected hashtags data for the panel
  const selectedHashtagsData = selectedHashtags.map(h => ({
    id: h.id,
    hashtag: h.hashtag,
    position: h.position || 0,
    selected_at: h.selected_at,
    status: h.status as 'selected' | 'primary' | 'secondary'
  }));

  const addedHashtags = availableHashtagsData.map(h => h.hashtag);
  const selectedHashtagsList = selectedHashtagsData.map(h => h.hashtag);

  return (
    <div className="space-y-8">
      {/* Product Info */}
      {selectedProduct !== 'all' && brandProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-600 text-white">Product Selected</Badge>
            <span className="font-medium text-blue-900">
              {brandProducts.find(p => p.id === selectedProduct)?.name || 'Selected Product'}
            </span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Hashtags will be filtered based on this product selection
          </p>
        </div>
      )}

      {/* Platform Selection Row */}
      <PlatformSelector
        selectedPlatforms={selectedPlatforms}
        onPlatformSelect={handlePlatformSelect}
        budget={budget}
        allowMultiPlatform={false} // Can be made configurable
      />

      {/* Hashtag Performance Matrix - Left Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HashtagPerformanceMatrix
            hashtags={matrixHashtags}
            onAddHashtag={handleAddToAvailable}
            onRemoveHashtag={handleRemoveSelected}
            addedHashtags={[...addedHashtags, ...selectedHashtagsList]}
          />
        </div>

        {/* Available and Selected Hashtags - Right Side */}
        <div className="space-y-6">
          <AvailableHashtagsPanel
            hashtags={availableHashtagsData}
            onSelectHashtag={handleSelectHashtag}
            onAddCustomHashtag={handleAddCustomHashtag}
            onRemoveHashtag={handleRemoveFromAvailable}
            selectedHashtags={selectedHashtagsList}
            isLoading={availableLoading}
          />

          <SelectedHashtagsPanel
            hashtags={selectedHashtagsData}
            onRemoveHashtag={handleRemoveSelected}
            onReorderHashtags={(reordered) => {
              // Handle reordering if needed
              console.log('Reordered hashtags:', reordered);
            }}
            maxHashtags={30}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedTrendsHashtagStrategy;