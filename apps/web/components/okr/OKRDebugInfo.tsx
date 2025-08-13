'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@boastitup/ui';
import { useCurrentPerformanceOKRs, useAttentionMetrics } from '../../hooks/useOKRData';
import { useBrandStore } from '../../store/brandStore';

export function OKRDebugInfo() {
  const { activeBrand } = useBrandStore();
  const { data: currentOKRs, isLoading } = useCurrentPerformanceOKRs(activeBrand?.id);
  const { data: attentionMetrics } = useAttentionMetrics(activeBrand?.id);

  if (isLoading) return <div>Loading debug info...</div>;

  // Group by title/objective_name to see duplicates
  const duplicateAnalysis = React.useMemo(() => {
    if (!currentOKRs) return {};
    
    const grouped = currentOKRs.reduce((acc, okr) => {
      const key = okr.title || okr.objective_name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(okr);
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }, [currentOKRs]);

  const duplicates = Object.entries(duplicateAnalysis).filter(([_, items]) => items.length > 1);

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-lg text-green-800">✅ OKR Deduplication Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <strong>Total OKRs returned:</strong> {currentOKRs?.length || 0}
          </div>
          
          <div>
            <strong>Brand ID:</strong> {activeBrand?.id || 'Not selected'}
          </div>

          <div>
            <strong>Unique Objectives:</strong> {Object.keys(duplicateAnalysis).length}
          </div>

          <div>
            <strong>Attention Metrics:</strong> {attentionMetrics?.length || 0} (Behind/At Risk)
          </div>

          {duplicates.length > 0 && (
            <div>
              <strong className="text-red-600">🚨 Duplicate Objectives Found:</strong>
              <div className="mt-2 space-y-2">
                {duplicates.map(([objective, items]) => (
                  <div key={objective} className="bg-white p-2 rounded border">
                    <div className="font-medium">{objective}</div>
                    <div className="text-xs text-gray-600">
                      Count: {items.length} | 
                      IDs: {items.map(item => item.okr_id || item.id).join(', ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Metrics: {items.map(item => item.metric_name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <strong>Sample Record Structure:</strong>
            {currentOKRs && currentOKRs[0] && (
              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto mt-1">
                {JSON.stringify(currentOKRs[0], null, 2)}
              </pre>
            )}
          </div>

          <div>
            <strong>All Record Keys:</strong>
            {currentOKRs && currentOKRs[0] && (
              <div className="text-xs text-gray-600">
                {Object.keys(currentOKRs[0]).join(', ')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}