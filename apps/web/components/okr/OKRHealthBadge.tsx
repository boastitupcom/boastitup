import React from 'react';
import { Badge } from '@boastitup/ui';
import { getHealthColor, getHealthLabel } from '../../utils/okrCalculations';

interface OKRHealthBadgeProps {
  health: 'green' | 'yellow' | 'red' | 'gray';
  score?: number;
  className?: string;
}

export function OKRHealthBadge({ health, score, className = '' }: OKRHealthBadgeProps) {
  const label = getHealthLabel(health);
  const colorClass = getHealthColor(health);
  
  return (
    <Badge 
      className={`px-2 py-1 text-xs font-medium border ${colorClass} ${className}`}
      variant="outline"
    >
      {label}
      {score && ` (${score}%)`}
    </Badge>
  );
}