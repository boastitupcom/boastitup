/**
 * Integration Settings - Main List Page
 * /workspace/settings/integrations
 *
 * Displays connected integrations and available platforms to connect
 */

'use client';

import React, { useEffect, useState } from 'react';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { PlatformCard } from '@/components/integrations/PlatformCard';
import type { IntegrationDefinition, TenantIntegration } from '@/types/integrations';

export default function IntegrationsPage() {
  const [definitions, setDefinitions] = useState<IntegrationDefinition[]>([]);
  const [integrations, setIntegrations] = useState<TenantIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/integrations');

      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }

      const data = await response.json();
      setDefinitions(data.definitions || []);
      setIntegrations(data.integrations || []);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect integration');
      }

      // Optimistically remove from UI
      setIntegrations(prev => prev.filter(integration => integration.id !== id));

      // Show success message (you can add toast notification here)
      console.log('Integration disconnected successfully');
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      alert('Failed to disconnect integration. Please try again.');
    }
  };

  // Get connected platform IDs
  const connectedPlatformIds = new Set(
    integrations.map(integration => integration.definition_id)
  );

  // Filter available platforms (not yet connected)
  const availablePlatforms = definitions.filter(
    definition => !connectedPlatformIds.has(definition.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading integrations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Integrations</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchIntegrations}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Settings</h1>
          <p className="text-muted-foreground">
            Connect your social media, analytics, and advertising platforms to track performance.
          </p>
        </div>

        {/* Connected Integrations Section */}
        {integrations.length > 0 && (
          <div className="mb-12">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Connected Platforms
              </h2>
              <p className="text-sm text-muted-foreground">
                {integrations.length} {integrations.length === 1 ? 'platform' : 'platforms'} connected
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Platforms Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {integrations.length > 0 ? 'Available Platforms' : 'Connect a Platform'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {availablePlatforms.length > 0
                ? `${availablePlatforms.length} ${availablePlatforms.length === 1 ? 'platform' : 'platforms'} available to connect`
                : 'All available platforms are connected'}
            </p>
          </div>

          {availablePlatforms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlatforms.map(definition => (
                <PlatformCard
                  key={definition.id}
                  definition={definition}
                  isConnected={false}
                />
              ))}
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-muted-foreground mb-4">
                No platforms available to connect at this time.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-muted-foreground">
                You've connected all available platforms! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Mobile Warning */}
        <div className="mt-8 md:hidden p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> For the best experience, please use a tablet or desktop device to manage integrations.
          </p>
        </div>
      </div>
    </div>
  );
}
