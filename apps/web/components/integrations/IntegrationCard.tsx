/**
 * IntegrationCard Component
 * Displays a connected integration with status and actions
 */

'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { TenantIntegration } from '@/types/integrations';

interface IntegrationCardProps {
  integration: TenantIntegration;
  onDisconnect: (id: string) => void;
}

export function IntegrationCard({ integration, onDisconnect }: IntegrationCardProps) {
  const definition = integration.definition;

  if (!definition) {
    return null;
  }

  const handleDisconnect = () => {
    if (confirm(`Are you sure you want to disconnect ${definition.display_name}?`)) {
      onDisconnect(integration.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {definition.logo_url && (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={definition.logo_url}
                  alt={definition.display_name}
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base">{definition.display_name}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {definition.category.replace('_', ' ')}
              </p>
            </div>
          </div>
          <StatusBadge status={integration.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {integration.error_message && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800">{integration.error_message}</p>
          </div>
        )}

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last sync:</span>
            <span className="font-medium">{formatDate(integration.last_sync_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connected:</span>
            <span className="font-medium">{formatDate(integration.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </CardFooter>
    </Card>
  );
}
