import React from 'react';
import { Badge } from '../../ui/badge';

interface OKRHealthBadgeProps {
  health: 'green' | 'yellow' | 'red' | 'gray';
  score?: number;
  className?: string;
}

// Health status configurations
const healthConfig = {
  green: {
    label: 'Healthy',
    class: 'bg-green-100 text-green-800 border-green-200'
  },
  yellow: {
    label: 'Warning',
    class: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  red: {
    label: 'Critical',
    class: 'bg-red-100 text-red-800 border-red-200'
  },
  gray: {
    label: 'N/A',
    class: 'bg-gray-100 text-gray-800 border-gray-200'
  }
};

export function OKRHealthBadge({ health, score, className = '' }: OKRHealthBadgeProps) {
  const config = healthConfig[health];
  
  return (
    <Badge 
      className={`px-2 py-1 text-xs font-medium border ${config.class} ${className}`}
      variant="outline"
    >
      {config.label}
      {score && ` (${score}%)`}
    </Badge>
  );
}