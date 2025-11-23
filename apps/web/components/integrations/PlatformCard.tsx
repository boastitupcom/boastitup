/**
 * PlatformCard Component
 * Displays an available platform that can be connected
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, Button, Badge } from '@boastitup/ui';
import type { IntegrationDefinition } from '@/types/integrations';

interface PlatformCardProps {
  definition: IntegrationDefinition;
  isConnected?: boolean;
}

export function PlatformCard({ definition, isConnected = false }: PlatformCardProps) {
  const router = useRouter();

  const handleConnect = () => {
    router.push(`/workspace/settings/integrations/add?platform=${definition.platform_key}`);
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
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {definition.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {definition.description || 'Connect this platform to track your data.'}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant={isConnected ? "outline" : "default"}
          size="sm"
          onClick={handleConnect}
          disabled={isConnected}
          className="w-full"
        >
          {isConnected ? 'Already Connected' : 'Connect'}
        </Button>
      </CardFooter>
    </Card>
  );
}
