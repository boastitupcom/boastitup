"use client";

import React from 'react';
import { Card, CardContent } from "@boastitup/ui";
import { BarChart3 } from "lucide-react";
import { useCompetitorContentMix } from "@boastitup/hooks";
import { useBrandStore } from "../../store/brandStore";

interface ContentMixStrategyProps {
  campaignId?: string;
}

const ContentMixStrategy: React.FC<ContentMixStrategyProps> = ({ campaignId }) => {
  const { activeBrand } = useBrandStore();
  const { data: contentMix, isLoading: contentMixLoading } = useCompetitorContentMix(activeBrand?.id || '');

  return (
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
  );
};

export default ContentMixStrategy;