import { Skeleton, Card, CardContent, CardHeader } from '@boastitup/ui';

export default function BrandHealthLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel Skeleton - Brand Score Card */}
        <div className="lg:col-span-1">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Circular progress skeleton */}
              <div className="p-8 rounded-full bg-gray-100">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel Skeleton - Tabs and Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Tabs skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-20" />
            </div>

            {/* Content skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start justify-between p-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 ml-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Additional loading indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Loading your brand health data...</span>
        </div>
      </div>
    </div>
  );
}