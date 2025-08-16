// apps/web/app/workspace/quickstart/snapshot/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  Calendar,
  BarChart3,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target?: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface TrafficLight {
  category: string;
  status: 'green' | 'yellow' | 'red';
  score: number;
  metrics: PerformanceMetric[];
  icon: React.ComponentType<any>;
  recommendation?: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: '1',
    name: 'Total Reach',
    value: '47.2K',
    change: '+12%',
    trend: 'up',
    status: 'excellent',
    target: '50K',
    description: 'Number of unique accounts reached',
    icon: Eye
  },
  {
    id: '2',
    name: 'Engagement Rate',
    value: '4.8%',
    change: '+0.7%',
    trend: 'up',
    status: 'good',
    target: '5.0%',
    description: 'Interactions per follower',
    icon: Heart
  },
  {
    id: '3',
    name: 'Follower Growth',
    value: '234',
    change: '-15%',
    trend: 'down',
    status: 'warning',
    target: '300',
    description: 'New followers this week',
    icon: Users
  },
  {
    id: '4',
    name: 'Response Time',
    value: '4.2h',
    change: '+2.1h',
    trend: 'down',
    status: 'critical',
    target: '2h',
    description: 'Average comment response time',
    icon: Clock
  },
  {
    id: '5',
    name: 'Post Frequency',
    value: '1.2/day',
    change: '-0.3',
    trend: 'down',
    status: 'warning',
    target: '1.5/day',
    description: 'Posts published per day',
    icon: Calendar
  },
  {
    id: '6',
    name: 'Share Rate',
    value: '2.1%',
    change: '+0.4%',
    trend: 'up',
    status: 'good',
    target: '2.5%',
    description: 'Content shared by audience',
    icon: Share2
  }
];

const trafficLights: TrafficLight[] = [
  {
    category: 'Content Performance',
    status: 'green',
    score: 85,
    icon: BarChart3,
    metrics: performanceMetrics.slice(0, 2),
    recommendation: 'Excellent! Your content is resonating well with your audience.'
  },
  {
    category: 'Audience Growth',
    status: 'yellow',
    score: 65,
    icon: Users,
    metrics: [performanceMetrics[2]],
    recommendation: 'Growth is slowing. Consider increasing posting frequency and engagement.'
  },
  {
    category: 'Community Management',
    status: 'red',
    score: 35,
    icon: MessageSquare,
    metrics: [performanceMetrics[3]],
    recommendation: 'Critical: Response times are too slow. Set up notifications for faster responses.'
  },
  {
    category: 'Publishing Consistency',
    status: 'yellow',
    score: 60,
    icon: Calendar,
    metrics: [performanceMetrics[4]],
    recommendation: 'Maintain consistent posting schedule. Consider batch content creation.'
  }
];

const quickActions = [
  {
    title: 'Improve Response Time',
    description: 'Set up mobile notifications for comments',
    urgency: 'high',
    estimated: '5 min',
    href: '/workspace/growthtools/engagement'
  },
  {
    title: 'Schedule More Content',
    description: 'Bulk schedule posts for next week',
    urgency: 'medium',
    estimated: '15 min',
    href: '/workspace/growthtools/publishing'
  },
  {
    title: 'Analyze Top Posts',
    description: 'Review your best performing content',
    urgency: 'low',
    estimated: '10 min',
    href: '/workspace/analytics'
  }
];

export default function PerformanceSnapshotPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrafficLightColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const overallHealth = Math.round(trafficLights.reduce((acc, light) => acc + light.score, 0) / trafficLights.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Performance Snapshot
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Traffic light system overview of your key metrics and health indicators
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Overall Health:</span>
              <div className={`w-4 h-4 rounded-full ${overallHealth >= 80 ? 'bg-green-500' : overallHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="font-semibold text-gray-900">{overallHealth}%</span>
            </div>
            <span className="text-gray-500">•</span>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            {['24h', '7d', '30d', '90d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {timeframe === '24h' ? 'Last 24 Hours' :
                 timeframe === '7d' ? 'Last 7 Days' :
                 timeframe === '30d' ? 'Last 30 Days' :
                 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Light Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {trafficLights.map((light, index) => (
            <div key={light.category} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getTrafficLightColor(light.status)}`} />
                    <light.icon className="w-6 h-6 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {light.category}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{light.score}%</span>
                    <p className="text-sm text-gray-500">Health Score</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {light.metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{action.estimated}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <Link href="/workspace/quickstart/wins" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back: Quick Wins
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <Link href="/workspace/quickstart/actions" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Next: Action Items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}-gray-700">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{metric.value}</span>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : metric.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <div className="w-4 h-4 bg-gray-400 rounded-full" />
                          )}
                          <span className={`text-sm ${
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {light.recommendation && (
                  <div className={`p-3 rounded-lg text-sm ${
                    light.status === 'green' ? 'bg-green-50 text-green-700' :
                    light.status === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {light.recommendation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Metrics Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6">
            <h2 className="text-xl font-bold">Detailed Metrics</h2>
            <p className="text-purple-100">Comprehensive view of all performance indicators</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performanceMetrics.map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <metric.icon className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    {metric.target && (
                      <p className="text-sm text-gray-500">Target: {metric.target}</p>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{metric.description}</p>
                  
                  {metric.target && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'excellent' ? 'bg-green-500' :
                            metric.status === 'good' ? 'bg-blue-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (parseFloat(metric.value.replace(/[^\d.]/g, '')) / parseFloat(metric.target.replace(/[^\d.]/g, ''))) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <h2 className="text-lg font-bold">Recommended Actions</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getUrgencyColor(action.urgency)}`}>
                        {action.urgency} priority
                      </span>
                      <span className="text-sm text-gray-500">
                        Estimated: {action.estimated}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    </div>
                    </div>
                    </Link>
                    ))}
                </div>
              </div>
            </div>
