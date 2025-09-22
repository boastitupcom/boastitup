"use client";

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@boastitup/ui";
import {
  TrendingUp,
  Target,
  Users,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useBrandStore } from "../../store/brandStore";
import {
  useTrendingTopicsWithPlatformFilter,
  usePlatformOptions,
  useProductHashtags,
  useCompetitorAnalysis,
  useCompetitorContentMix,
  useAudienceOverlap,
  useBrandProducts,
  useCampaignAvailableHashtags,
  useCampaignSelectedHashtags,
  useAddHashtagToAvailable,
  useSelectHashtagForCampaign,
  useRemoveSelectedHashtag
} from "@boastitup/hooks";
import { PlatformSelector } from "./PlatformSelector";
import type { CampaignPlatform } from "@boastitup/types";

interface EnhancedTrendsHashtagStrategyProps {
  campaignId: string;
  selectedProductId?: string;
  onPlatformChange?: (platform: CampaignPlatform) => void;
}


const EnhancedTrendsHashtagStrategy: React.FC<EnhancedTrendsHashtagStrategyProps> = ({
  campaignId,
  selectedProductId,
  onPlatformChange
}) => {
  const { activeBrand } = useBrandStore();
  const [selectedPlatform, setSelectedPlatform] = useState<CampaignPlatform | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<string>(selectedProductId || 'all');

  const handlePlatformSelect = (platform: CampaignPlatform) => {
    setSelectedPlatform(platform);
    onPlatformChange?.(platform);
  };

  // Data hooks
  const { data: platformOptions = [], isLoading: platformLoading } = usePlatformOptions();
  const { data: brandProducts = [], isLoading: productsLoading } = useBrandProducts(activeBrand?.id || '');
  const { data: trendingTopics = [], isLoading: trendingLoading } = useTrendingTopicsWithPlatformFilter(
    activeBrand?.id || '',
    selectedPlatform || 'all',
    selectedProduct
  );
  const { data: productHashtags = [], isLoading: hashtagsLoading } = useProductHashtags(
    activeBrand?.id || '',
    selectedProduct
  );
  const { data: competitorData = [], isLoading: competitorLoading } = useCompetitorAnalysis(activeBrand?.id || '');
  const { data: contentMix, isLoading: contentMixLoading } = useCompetitorContentMix(activeBrand?.id || '');
  const { data: audienceOverlap } = useAudienceOverlap(activeBrand?.id || '');

  // Hashtag management hooks
  const { data: availableHashtags = [], isLoading: availableLoading } = useCampaignAvailableHashtags(campaignId);
  const { data: selectedHashtags = [], isLoading: selectedLoading } = useCampaignSelectedHashtags(campaignId);
  const addToAvailable = useAddHashtagToAvailable();
  const selectHashtag = useSelectHashtagForCampaign();
  const removeSelected = useRemoveSelectedHashtag();


  // Hashtag actions
  const handleAddToAvailable = async (hashtag: string) => {
    try {
      await addToAvailable.mutateAsync({
        campaignId,
        hashtag,
        source: 'trending'
      });
      toast.success(`${hashtag} added to available hashtags`);
    } catch (error) {
      toast.error('Failed to add hashtag');
    }
  };

  const handleSelectHashtag = async (hashtag: string) => {
    try {
      await selectHashtag.mutateAsync({ campaignId, hashtag });
      toast.success(`${hashtag} selected for campaign`);
    } catch (error) {
      toast.error('Failed to select hashtag');
    }
  };

  const handleRemoveSelected = async (hashtag: string) => {
    try {
      await removeSelected.mutateAsync({ campaignId, hashtag });
      toast.success(`${hashtag} removed from selection`);
    } catch (error) {
      toast.error('Failed to remove hashtag');
    }
  };

  // Group competitors by type
  const competitorsByType = competitorData.reduce((acc, comp) => {
    if (!acc[comp.competitor_type]) acc[comp.competitor_type] = [];
    acc[comp.competitor_type].push(comp);
    return acc;
  }, {} as Record<string, typeof competitorData>);

  return (
    <div className="space-y-6">
      {/* Platform Selection Row */}
      <PlatformSelector
        selectedPlatform={selectedPlatform}
        onPlatformSelect={handlePlatformSelect}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Trending Topics Panel */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Trending Topics</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">ℹ️</span>
              </div>

              {trendingLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingTopics.slice(0, 3).map((topic) => (
                    <div key={topic.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{topic.trend_name}</h4>
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                          {topic.growth_percentage ? `+${topic.growth_percentage}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="text-gray-500">Vol: </span>
                          <span className="font-medium">{
                            topic.volume >= 1000000 ? `${(topic.volume / 1000000).toFixed(1)}M` :
                            topic.volume >= 1000 ? `${(topic.volume / 1000).toFixed(0)}K` :
                            topic.volume.toString()
                          }</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Velocity: </span>
                          <span className="font-medium capitalize">{topic.velocity_category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sentiment: </span>
                          <span className="font-medium">
                            {topic.sentiment_score > 0.6 ? 'Positive' :
                             topic.sentiment_score > 0.4 ? 'Neutral' :
                             topic.sentiment_score < 0.4 ? 'Negative' : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToAvailable(topic.hashtag_display || `#${topic.trend_name}`)}
                        disabled={addToAvailable.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                      >
                        + Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Competitor Audience Analysis</h3>
              </div>

              {competitorLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {audienceOverlap && Object.entries(audienceOverlap).map(([competitor, overlap]) => (
                    <div key={competitor} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 capitalize">
                          {competitor.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-600">Overlap: {overlap}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Product-Specific Hashtags */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Product-Specific Hashtags</h3>
              </div>

              {/* Product Selection */}
              <div className="mb-4">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select a product to see relevant hashtags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {brandProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct === 'all' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-700 text-sm">
                    Please select a product first to see relevant hashtags.
                  </p>
                </div>
              ) : hashtagsLoading ? (
                <div className="animate-pulse">Loading hashtags...</div>
              ) : productHashtags.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Selected Hashtags (0)</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
                    <p className="text-gray-400 text-sm">Drop hashtags here</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {productHashtags.slice(0, 10).map((hashtag, index) => (
                      <Badge
                        key={index}
                        className="cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-3 py-1"
                        onClick={() => handleSelectHashtag(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 text-sm">
                    No hashtags found for this product. Try selecting trending hashtags above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Mix Strategy */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Content Mix Strategy</h3>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Direct Competitor Averages</h4>
                {contentMixLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : contentMix ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Video Content</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${contentMix.video_content}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{contentMix.video_content}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Carousel Posts</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${contentMix.carousel_posts}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{contentMix.carousel_posts}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Stories</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${contentMix.stories}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{contentMix.stories}%</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Timing Strategy */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Timing</h3>
              <div className="flex space-x-2">
                <Badge className="bg-red-100 text-red-700 border-0">Direct</Badge>
                <Badge className="bg-yellow-100 text-yellow-700 border-0">Aspirational</Badge>
                <Badge className="bg-green-100 text-green-700 border-0">Industry Leader</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audience Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Audience Selection</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Target Audience</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-purple-700 border-purple-300">Gen Z (18-24)</Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">Millennials (25-40)</Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">Gen X (41-56)</Badge>
                <Badge variant="outline" className="text-gray-700 border-gray-300">Eco-Conscious</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-purple-700 border-purple-300">Tech Enthusiasts</Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">Remote Workers</Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">Entrepreneurs</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Custom Audience (Optional)</h4>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500"
                rows={3}
                placeholder="Describe your specific audience characteristics..."
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Target Audience Insights</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  Select a product to see audience insights
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTrendsHashtagStrategy;