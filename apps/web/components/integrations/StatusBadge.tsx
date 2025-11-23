/**
 * StatusBadge Component
 * Displays integration status with appropriate color and icon
 */

import React from 'react';
import { Badge } from '@repo/ui/components/ui/badge';
import type { IntegrationStatus } from '@/types/integrations';

interface StatusBadgeProps {
  status: IntegrationStatus;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    icon: '●'
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    icon: '✕'
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
    icon: '⚠'
  },
  disconnected: {
    label: 'Disconnected',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    icon: '○'
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
