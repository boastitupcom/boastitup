"use client";

import React from 'react';
import { Card, CardContent, Badge } from "@boastitup/ui";
import { Clock } from "lucide-react";

interface TimingStrategyProps {
  campaignId?: string;
}

const TimingStrategy: React.FC<TimingStrategyProps> = ({ campaignId }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Timing Strategy</h3>
        </div>
        <div className="flex space-x-2">
          <Badge className="bg-red-100 text-red-700 border-0">Direct</Badge>
          <Badge className="bg-yellow-100 text-yellow-700 border-0">Aspirational</Badge>
          <Badge className="bg-green-100 text-green-700 border-0">Industry Leader</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimingStrategy;