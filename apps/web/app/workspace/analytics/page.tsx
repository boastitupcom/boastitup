// apps/web/app/workspace/analytics/page.tsx
import { TrendSurgeDetector } from '@/components/TrendSurgeDetector';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Monitor trends, analyze performance, and track your social media growth
          </p>
        </div>

        <TrendSurgeDetector />
      </div>
    </div>
  );
}