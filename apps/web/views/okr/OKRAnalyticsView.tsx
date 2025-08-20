"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription
} from "@boastitup/ui";

import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Award,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";

import { useBrandContext } from "../../hooks/use-brand-context";
import { ManagedOKR } from "../../types/okr-creation";

// Analytics-specific types
interface OKRAnalyticsData {
  okrs: ManagedOKR[];
  progressMetrics: {
    totalOKRs: number;
    activeOKRs: number;
    completedOKRs: number;
    averageProgress: number;
    onTrackCount: number;
    atRiskCount: number;
    overdueCount: number;
  };
  trendData: Array<{
    period: string;
    completed: number;
    created: number;
    averageProgress: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageProgress: number;
    color: string;
  }>;
  platformDistribution: Array<{
    platform: string;
    count: number;
    progress: number;
  }>;
}

interface OKRAnalyticsViewProps {
  initialData: OKRAnalyticsData;
  brandId: string;
  tenantId: string;
}

export function OKRAnalyticsView({ 
  initialData, 
  brandId, 
  tenantId 
}: OKRAnalyticsViewProps) {
  const [data, setData] = useState<OKRAnalyticsData>(initialData);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { brand, permissions } = useBrandContext(brandId);

  // Computed metrics
  const healthScore = useMemo(() => {
    const metrics = data.progressMetrics;
    const totalActive = metrics.activeOKRs;
    if (totalActive === 0) return 0;
    
    const onTrackWeight = 0.5;
    const progressWeight = 0.3;
    const completionWeight = 0.2;
    
    const onTrackScore = (metrics.onTrackCount / totalActive) * 100 * onTrackWeight;
    const progressScore = metrics.averageProgress * progressWeight;
    const completionScore = (metrics.completedOKRs / metrics.totalOKRs) * 100 * completionWeight;
    
    return Math.round(onTrackScore + progressScore + completionScore);
  }, [data.progressMetrics]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  // Filtered data based on selections
  const filteredOKRs = useMemo(() => {
    let filtered = data.okrs;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(okr => 
        okr.okr_master?.category === selectedCategory
      );
    }
    
    return filtered;
  }, [data.okrs, selectedCategory]);

  // Chart colors
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    const csvContent = generateCSVReport(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `okr-analytics-${brand?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Permission check
  if (permissions && !permissions.canViewAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            You don't have permission to view analytics for this brand. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OKR Analytics</h1>
            <p className="text-gray-600 mt-2">
              Performance insights and progress tracking for {brand?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {data.categoryBreakdown.map(category => (
              <SelectItem key={category.category} value={category.category}>
                {category.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}%
                </p>
                {getHealthScoreBadge(healthScore)}
              </div>
              <Award className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                <p className="text-3xl font-bold">
                  {Math.round(data.progressMetrics.averageProgress)}%
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+5% vs last month</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Track</p>
                <p className="text-3xl font-bold text-green-600">
                  {data.progressMetrics.onTrackCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {data.progressMetrics.activeOKRs} active
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-3xl font-bold text-red-600">
                  {data.progressMetrics.atRiskCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Need attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
        </TabsList>

        {/* Progress Tracking */}
        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>OKR Status Distribution</CardTitle>
                <CardDescription>Breakdown of OKR completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: data.progressMetrics.completedOKRs, fill: '#00C49F' },
                        { name: 'On Track', value: data.progressMetrics.onTrackCount, fill: '#0088FE' },
                        { name: 'At Risk', value: data.progressMetrics.atRiskCount, fill: '#FFBB28' },
                        { name: 'Overdue', value: data.progressMetrics.overdueCount, fill: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Histogram</CardTitle>
                <CardDescription>Distribution of OKR progress percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateProgressHistogram(filteredOKRs)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>OKR creation and completion trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Created OKRs"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Completed OKRs"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="averageProgress" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Average Progress %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Performance breakdown by OKR category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                  <Bar dataKey="averageProgress" fill="#82ca9d" name="Avg Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms */}
        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>OKR distribution and performance across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.platformDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="OKR Count" />
                  <Bar dataKey="progress" fill="#82ca9d" name="Avg Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights & Recommendations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Automated analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateInsights(data).map((insight, index) => (
              <Alert key={index} className={`border-l-4 ${insight.type === 'warning' ? 'border-l-yellow-500' : insight.type === 'success' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{insight.title}</strong>: {insight.description}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function generateProgressHistogram(okrs: ManagedOKR[]) {
  const ranges = [
    { range: '0-20%', min: 0, max: 20 },
    { range: '21-40%', min: 21, max: 40 },
    { range: '41-60%', min: 41, max: 60 },
    { range: '61-80%', min: 61, max: 80 },
    { range: '81-100%', min: 81, max: 100 }
  ];

  return ranges.map(range => {
    const count = okrs.filter(okr => {
      const progress = calculateProgress(okr);
      return progress >= range.min && progress <= range.max;
    }).length;
    
    return {
      range: range.range,
      count
    };
  });
}

function calculateProgress(okr: ManagedOKR): number {
  // Mock progress calculation - in real implementation this would use actual metrics
  return Math.random() * 100;
}

function generateInsights(data: OKRAnalyticsData) {
  const insights = [];
  
  if (data.progressMetrics.atRiskCount > 0) {
    insights.push({
      type: 'warning',
      title: 'OKRs at Risk',
      description: `${data.progressMetrics.atRiskCount} OKRs are at risk of missing their targets. Consider adjusting targets or increasing resources.`
    });
  }
  
  if (data.progressMetrics.averageProgress > 80) {
    insights.push({
      type: 'success',
      title: 'Excellent Progress',
      description: `Your team is performing exceptionally well with ${Math.round(data.progressMetrics.averageProgress)}% average progress.`
    });
  }
  
  const topCategory = data.categoryBreakdown.reduce((prev, current) => 
    (prev.averageProgress > current.averageProgress) ? prev : current
  );
  
  insights.push({
    type: 'info',
    title: 'Top Performing Category',
    description: `${topCategory.category} is your highest performing category with ${Math.round(topCategory.averageProgress)}% average progress.`
  });
  
  return insights;
}

function generateCSVReport(data: OKRAnalyticsData): string {
  const headers = ['Category', 'Count', 'Average Progress', 'Status'];
  const rows = data.categoryBreakdown.map(category => [
    category.category,
    category.count.toString(),
    `${Math.round(category.averageProgress)}%`,
    category.averageProgress > 80 ? 'On Track' : category.averageProgress > 60 ? 'At Risk' : 'Behind'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}