// apps/web/app/workspace/growth-tools/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  ArrowRight, 
  Clock, 
  Users, 
  Target,
  Zap,
  Instagram,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Send,
  Settings,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Play,
  Globe,
  Smartphone,
  BarChart3,
  Activity,
  Award,
  Rocket
} from 'lucide-react';

interface GrowthToolCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  features: string[];
  metrics?: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  status?: 'live' | 'beta' | 'coming-soon';
}

const growthToolCards: GrowthToolCard[] = [
  {
    title: 'Publishing & Scheduling',
    description: 'Smart calendar and bulk scheduler for consistent content delivery across all platforms',
    href: '/workspace/growth-tools/publishing',
    icon: Calendar,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    features: [
      'Multi-platform scheduling',
      'Optimal timing AI',
      'Bulk content upload',
      'Content calendar view',
      'Auto-reposting'
    ],
    metrics: {
      label: 'Posts Scheduled',
      value: '2,847',
      trend: 'up'
    },
    status: 'live'
  },
  {
    title: 'Engagement Hub',
    description: 'Unified inbox and community management for authentic customer relationships',
    href: '/workspace/growth-tools/engagement',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
    features: [
      'Unified inbox management',
      'AI response suggestions',
      'Community sentiment tracking',
      'Influencer identification',
      'Response templates'
    ],
    metrics: {
      label: 'Messages Processed',
      value: '12.3K',
      trend: 'up'
    },
    status: 'live'
  },
  {
    title: 'Performance Tracking',
    description: 'Simple dashboard with competitor benchmarking and actionable growth insights',
    href: '/workspace/growth-tools/performance',
    icon: BarChart,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    features: [
      'Real-time analytics',
      'Competitor benchmarking',
      'Growth predictions',
      'ROI tracking',
      'Custom reports'
    ],
    metrics: {
      label: 'Growth Rate',
      value: '+34.2%',
      trend: 'up'
    },
    status: 'live'
  }
];

const quickStats = [
  { label: 'Total Reach', value: '2.4M', change: '+23%', icon: Eye },
  { label: 'Engagement Rate', value: '4.8%', change: '+12%', icon: Heart },
  { label: 'Followers Growth', value: '+15.2K', change: '+8%', icon: Users },
  { label: 'Posts Published', value: '342', change: '+45%', icon: Send }
];

const recentActivity = [
  {
    type: 'success',
    title: 'Instagram post went viral',
    description: 'Your latest reel reached 847K people (+340% above average)',
    time: '2 hours ago',
    icon: Instagram,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    type: 'warning',
    title: 'TikTok engagement dropping',
    description: 'Last 3 posts performed 23% below your average',
    time: '5 hours ago',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    type: 'info',
    title: 'New competitor analysis ready',
    description: 'Weekly report comparing your performance with top 5 competitors',
    time: '1 day ago',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    type: 'success',
    title: 'Content calendar optimized',
    description: 'AI suggested posting times improved reach by 18%',
    time: '2 days ago',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
];

const upcomingFeatures = [
  {
    title: 'AI Content Optimizer',
    description: 'Real-time content performance predictions',
    eta: 'Next Week',
    status: 'beta'
  },
  {
    title: 'Cross-Platform Analytics',
    description: 'Unified reporting across all social channels',
    eta: 'Next Month',
    status: 'coming-soon'
  },
  {
    title: 'Automated A/B Testing',
    description: 'Test variations automatically for optimal performance',
    eta: '2 Months',
    status: 'coming-soon'
  }
];

export default function GrowthToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Growth Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Actionable growth levers that drive real results. Streamline your social media operations with intelligent automation and data-driven insights.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <stat.icon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Main Growth Tool Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {growthToolCards.map((tool, index) => (
            <Link key={tool.title} href={tool.href}>
              <div className={`group relative bg-gradient-to-br ${tool.bgGradient} border border-white/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md ${tool.color}`}>
                      <tool.icon className="w-8 h-8" />
                    </div>
                    {tool.status && (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        tool.status === 'live' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : tool.status === 'beta'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {tool.status === 'live' ? 'LIVE' : tool.status === 'beta' ? 'BETA' : 'COMING SOON'}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Metrics */}
                  {tool.metrics && (
                    <div className="bg-white/60 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{tool.metrics.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{tool.metrics.value}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          tool.metrics.trend === 'up' ? 'text-green-600' : 
                          tool.metrics.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {tool.metrics.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : tool.metrics.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Real-time updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Explore Tool</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6" />
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              <p className="mt-2 text-green-100">
                Real-time updates on your growth performance
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className={`flex items-start gap-4 p-4 ${activity.bgColor} rounded-xl hover:shadow-md transition-shadow`}>
                    <div className={`flex-shrink-0 w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center border border-current border-opacity-20`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {activity.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/workspace/analytics" className="mt-6 inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                View All Activity
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                <h2 className="text-xl font-bold">Coming Soon</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {upcomingFeatures.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {feature.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        feature.status === 'beta' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature.status === 'beta' ? 'BETA' : 'PLANNED'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {feature.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Want early access?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Join our beta program to test new features first.
                </p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                  Join Beta Program
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Accelerate Your Growth?
              </h3>
              <p className="text-gray-600 mb-6">
                Our growth tools are designed to work together seamlessly. Start with one tool and expand your arsenal as you scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/workspace/growth-tools/publishing">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md">
                    Start with Publishing
                  </button>
                </Link>
                <Link href="/workspace/analytics">
                  <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    View Performance Data
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}