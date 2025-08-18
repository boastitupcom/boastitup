// apps/web/app/workspace/intelligence/page.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Activity,
  BarChart2,
  Search,
  Users,
  LineChart,
  PieChart,
  Globe,
  Brain,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
  Lightbulb
} from 'lucide-react';

// Types for our dummy data
interface AIAlert {
  id: string;
  type: 'warning' | 'opportunity' | 'critical';
  title: string;
  message: string;
  actionUrl: string;
  timestamp: string;
  confidence: number;
}

interface ModuleData {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  color: string;
  metrics?: {
    label: string;
    value: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  subModules: {
    title: string;
    path: string;
    description: string;
    metrics?: string;
  }[];
}

// Dummy data
const aiAlerts: AIAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Competitive Threat Detected',
    message: "Market trend for 'AI content' is up 45%, but your competitor's share-of-voice grew 2x faster than yours last month. Your organic traffic declined 12% while theirs increased 28%.",
    actionUrl: '/workspace/intelligence/competitors/overview',
    timestamp: '2 hours ago',
    confidence: 94
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Emerging Trend Opportunity',
    message: "New hashtag #SustainableDesign2025 showing 340% growth with low competition. Early adoption could capture 15% market share in your segment.",
    actionUrl: '/workspace/intelligence/trends/social',
    timestamp: '4 hours ago',
    confidence: 87
  },
  {
    id: '3',
    type: 'warning',
    title: 'Content Performance Decline',
    message: "Your content engagement dropped 23% across platforms while industry average increased 8%. Recommend immediate content strategy review.",
    actionUrl: '/workspace/intelligence/performance/content',
    timestamp: '6 hours ago',
    confidence: 92
  }
];

const performanceMetrics = [
  { label: 'Organic Traffic', value: '124.5K', change: -12, trend: 'down' as const },
  { label: 'Keyword Rankings', value: '1,247', change: 8, trend: 'up' as const },
  { label: 'Social Reach', value: '89.2K', change: -5, trend: 'down' as const },
  { label: 'Community Growth', value: '3,456', change: 15, trend: 'up' as const }
];

const trendMetrics = [
  { label: 'Rising Topics', value: '23', change: 45, trend: 'up' as const },
  { label: 'Viral Content', value: '7', change: 12, trend: 'up' as const },
  { label: 'Market Shifts', value: '5', change: -8, trend: 'down' as const }
];

const competitorMetrics = [
  { label: 'Tracked Competitors', value: '8', change: 0, trend: 'stable' as const },
  { label: 'Market Share Gap', value: '-15%', change: -5, trend: 'down' as const },
  { label: 'Content Velocity', value: '2.3x', change: 20, trend: 'up' as const }
];

const moduleData: ModuleData[] = [
  {
    icon: BarChart2,
    title: 'Performance Hub',
    subtitle: 'How are we performing?',
    description: 'Your centralized performance analytics hub, featuring real-time monitoring of all your owned digital assets and channels.',
    path: '/workspace/intelligence/performance',
    color: 'from-green-500 to-emerald-600',
    metrics: performanceMetrics,
    subModules: [
      {
        title: 'SEO Performance',
        path: '/workspace/intelligence/performance/seo',
        description: 'Real-time keyword rankings, organic traffic flows, and technical SEO scores',
        metrics: '1,247 keywords tracked'
      },
      {
        title: 'Content Analytics',
        path: '/workspace/intelligence/performance/content',
        description: 'Content engagement rates, conversion paths, and ROI analysis per piece',
        metrics: '89% avg engagement rate'
      },
      {
        title: 'Social Performance',
        path: '/workspace/intelligence/performance/social',
        description: 'Organic reach analysis and engagement funnel optimization',
        metrics: '124.5K monthly reach'
      },
      {
        title: 'Community Health',
        path: '/workspace/intelligence/performance/community',
        description: 'Member acquisition tracking and community health scoring',
        metrics: '3,456 active members'
      }
    ]
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    subtitle: 'What is our market doing?',
    description: 'Stay ahead of the curve with comprehensive trend intelligence that spots opportunities before your competitors.',
    path: '/workspace/intelligence/trends',
    color: 'from-orange-500 to-amber-600',
    metrics: trendMetrics,
    subModules: [
      {
        title: 'Web Trends',
        path: '/workspace/intelligence/trends/web',
        description: 'Google Trends integration with predictive modeling',
        metrics: '23 rising topics detected'
      },
      {
        title: 'Social Trends',
        path: '/workspace/intelligence/trends/social',
        description: 'Emerging hashtags and viral content formats',
        metrics: '7 viral opportunities'
      },
      {
        title: 'E-commerce Trends',
        path: '/workspace/intelligence/trends/ecommerce',
        description: 'Trending products and consumer buying patterns',
        metrics: '15 product opportunities'
      },
      {
        title: 'Unified Intelligence',
        path: '/workspace/intelligence/trends/unified',
        description: 'AI-powered synthesis of macro-level market shifts',
        metrics: '5 major shifts identified'
      }
    ]
  },
  {
    icon: Target,
    title: 'Competitor Intelligence',
    subtitle: 'What is our competition doing?',
    description: 'Comprehensive competitive intelligence platform for benchmarking and strategic planning.',
    path: '/workspace/intelligence/competitors',
    color: 'from-red-500 to-rose-600',
    metrics: competitorMetrics,
    subModules: [
      {
        title: 'Competitive Overview',
        path: '/workspace/intelligence/competitors/overview',
        description: 'Side-by-side benchmark dashboard with gap analysis',
        metrics: '8 competitors tracked'
      },
      {
        title: 'SEO Intelligence',
        path: '/workspace/intelligence/competitors/seo',
        description: 'Track competitors\' keyword rankings and backlinks',
        metrics: '2,340 competitor keywords'
      },
      {
        title: 'Content Intelligence',
        path: '/workspace/intelligence/competitors/content',
        description: 'Analyze competitors\' content velocity and performance',
        metrics: '156 content pieces analyzed'
      },
      {
        title: 'Social Intelligence',
        path: '/workspace/intelligence/competitors/social',
        description: 'Monitor competitors\' social media strategies',
        metrics: '45% share of voice'
      }
    ]
  }
];

function getAlertIcon(type: AIAlert['type']) {
  switch (type) {
    case 'critical': return AlertTriangle;
    case 'warning': return Clock;
    case 'opportunity': return Lightbulb;
    default: return Brain;
  }
}

function getAlertColor(type: AIAlert['type']) {
  switch (type) {
    case 'critical': return 'from-red-500 to-red-600';
    case 'warning': return 'from-yellow-500 to-orange-600';
    case 'opportunity': return 'from-blue-500 to-indigo-600';
    default: return 'from-gray-500 to-gray-600';
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return ArrowUp;
    case 'down': return ArrowDown;
    default: return Activity;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export default function StrategicGrowthIntelligencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Strategic Growth Intelligence
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered command center for strategic growth decisions
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-gray-600">Opportunities</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-600">Competitors</div>
            </div>
          </div>
        </div>

        {/* AI Alerts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI-Powered Intelligence Alerts
          </h2>
          <div className="space-y-4">
            {aiAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${getAlertColor(alert.type)}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getAlertColor(alert.type)} rounded-lg flex items-center justify-center`}>
                          <AlertIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{alert.timestamp}</span>
                            <span>•</span>
                            <span>{alert.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        href={alert.actionUrl}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        View Analysis →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Command Center Dashboard */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Command Center Dashboard</h2>
            </div>
            <p className="text-blue-100 mb-4">
              Your C-suite-ready command center that synthesizes the most critical insights from all sub-modules.
            </p>
            <div className="text-xs text-blue-200 font-mono">
              /workspace/intelligence/dashboard
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="space-y-8">
          {moduleData.map((module) => {
            const ModuleIcon = module.icon;
            return (
              <div key={module.title} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center`}>
                        <ModuleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 italic text-sm">
                          {module.subtitle}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={module.path}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Open Module →
                    </Link>
                  </div>

                  <p className="text-gray-700 mb-6">
                    {module.description}
                  </p>

                  {/* Quick Metrics */}
                  {module.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {module.metrics.map((metric) => {
                        const TrendIcon = getTrendIcon(metric.trend);
                        return (
                          <div key={metric.label} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">{metric.label}</span>
                              <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {metric.value}
                            </div>
                            <div className={`text-xs ${getTrendColor(metric.trend)}`}>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-modules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {module.subModules.map((subModule) => (
                      <Link 
                        key={subModule.title}
                        href={subModule.path}
                        className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="text-xs text-gray-500 font-mono mb-2">
                          {subModule.path}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {subModule.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {subModule.description}
                        </p>
                        {subModule.metrics && (
                          <div className="text-xs text-blue-600 font-medium">
                            {subModule.metrics}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Transform Your Growth Strategy?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Leverage AI-powered insights to outmaneuver competitors, spot emerging trends, and optimize your performance across all channels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/workspace/intelligence/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Open Command Center
              </Link>
              <Link 
                href="/workspace/settings/brand"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Configure Competitors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}