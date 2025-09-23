"use client";

import React from 'react';
import { Card, CardContent } from "@boastitup/ui";
import { BarChart3 } from "lucide-react";
import { useCompetitorAnalysis, useAudienceOverlap } from "@boastitup/hooks";
import { useBrandStore } from "../../store/brandStore";

interface CompetitorAudienceAnalysisProps {
  campaignId?: string;
}

const CompetitorAudienceAnalysis: React.FC<CompetitorAudienceAnalysisProps> = ({ campaignId }) => {
  const { activeBrand } = useBrandStore();
  const { data: competitorData = [], isLoading: competitorLoading } = useCompetitorAnalysis(activeBrand?.id || '');
  const { data: audienceOverlap } = useAudienceOverlap(activeBrand?.id || '');

  // Group competitors by type
  const competitorsByType = competitorData.reduce((acc, comp) => {
    if (!acc[comp.competitor_type]) acc[comp.competitor_type] = [];
    acc[comp.competitor_type].push(comp);
    return acc;
  }, {} as Record<string, typeof competitorData>);

  return (
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
  );
};

export default CompetitorAudienceAnalysis;