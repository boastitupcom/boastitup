'use client';

import React from 'react';
import { Card, CardContent, CardHeader, Badge } from '@boastitup/ui';
import { ProgressRing } from './ProgressRing';
import { OKRHealthBadge } from './OKRHealthBadge';
import { calculateOKRStatus } from '../../utils/okrCalculations';
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import type { OKRMetric } from '../../types/okr';

interface OKRCardProps {
  okr: OKRMetric;
  onClick?: () => void;
  className?: string;
}

export function OKRCard({ okr, onClick, className = '' }: OKRCardProps) {
  const status = calculateOKRStatus(okr);
  const isAtRisk = status.health === 'red';
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {okr.title || okr.objective_name}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {okr.metric_name}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {isAtRisk && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <OKRHealthBadge health={status.health} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <ProgressRing progress={status.progress_percentage} />
              <div className="flex flex-col text-sm">
                <span className="text-gray-500">Current</span>
                <span className="font-semibold text-gray-900">
                  {okr.current_value?.toLocaleString() ?? 'N/A'}
                </span>
              </div>
              <div className="flex flex-col text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-semibold text-gray-900">
                  {(okr.target_value || okr.metric_target_value)?.toLocaleString() ?? 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {okr.okr_category && (
                  <Badge variant="secondary" className="text-xs">
                    {okr.okr_category}
                  </Badge>
                )}
                {okr.platform_name && (
                  <Badge variant="outline" className="text-xs">
                    {okr.platform_name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Target className="h-3 w-3 mr-1" />
                {status.status}
              </div>
            </div>
          </div>
        </div>
        
        {okr.last_updated && (
          <div className="text-xs text-gray-400 mt-3 pt-3 border-t">
            Last updated: {new Date(okr.last_updated).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}