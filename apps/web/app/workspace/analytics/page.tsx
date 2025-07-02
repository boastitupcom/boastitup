// apps/web/app/workspace/analytics/page.tsx
'use client';

import { useAnalyticsData } from '@boastitup/hooks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@boastitup/ui';

export default function AnalyticsPage() {
  const tenantId = 'tenant-123';
  const brandId = 'brand-456';

  const { data, isLoading, error } = useAnalyticsData({ tenantId, brandId });

  const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="p-8">Loading Analytics...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error loading data: {error.message}</div>;
  }

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Growth Hub</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Social Engagement" value={data?.socialEngagement.toLocaleString() ?? 'N/A'} />
        <StatCard title="Conversion Rate" value={`${data?.conversionRate ?? 'N/A'}%`} />
        <StatCard title="Ad Spend ROI" value={`${data?.adSpendROI ?? 'N/A'}x`} />
        <StatCard title="Growth Efficiency Score" value={data?.growthEfficiencyScore ?? 'N/A'} />
      </div>
    </main>
  );
}
