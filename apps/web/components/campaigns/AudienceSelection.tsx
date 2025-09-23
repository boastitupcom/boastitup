"use client";

import React from 'react';
import { Card, CardContent, Badge } from "@boastitup/ui";
import { Users } from "lucide-react";

interface AudienceSelectionProps {
  campaignId?: string;
}

const AudienceSelection: React.FC<AudienceSelectionProps> = ({ campaignId }) => {
  return (
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
  );
};

export default AudienceSelection;