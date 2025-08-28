// apps/web/app/workspace/growth-accelerators/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUp, 
  Search, 
  Megaphone, 
  Users, 
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Brain,
  Rocket,
  Globe,
  DollarSign,
  Star,
  Eye,
  MousePointer,
  MessageSquare,
  UserPlus,
  Activity,
  Award,
  Lightbulb,
  Bot,
  Calendar,
  RefreshCw,
  Shield,
  FileText,
  Send,
  ChevronRight,
  Plus,
  Sparkles,
  Layers,
  LineChart,
  PieChart,
  Filter,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface AcceleratorTool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  features: string[];
  metrics: {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  automations: {
    name: string;
    description: string;
    status: 'active' | 'paused' | 'scheduled';
    impact: string;
  }[];
  status: 'live' | 'beta' | 'coming-soon';
}

const acceleratorTools: AcceleratorTool[] = [
  {
    id: 'seo',
    title: 'SEO Booster',
    description: 'Keyword tracker and content gap analysis with automated optimization workflows',
    href: '/workspace/growth-accelerators/seo',
    icon: Search,
    color: 'text-green-600',
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
    features: [
      'Real-time keyword tracking',
      'Content gap analysis',
      'Competitor research automation',
      'Technical SEO monitoring',
      'SERP feature tracking',
      'Automated content optimization'
    ],
    metrics: {
      label: 'Organic Traffic Growth',
      value: '+147%',
      change: '+23%',
      trend: 'up'
    },
    automations: [
      {
        name: 'Keyword Rank Monitor',
        description: 'Daily tracking of 347 target keywords with alert system',
        status: 'active',
        impact: '+12% visibility'
      },
      {
        name: 'Content Gap Finder',
        description: 'Weekly analysis of competitor content opportunities',
        status: 'active',
        impact: '28 new topics'
      },
      {
        name: 'Technical SEO Audit',
        description: 'Automated site health checks and performance monitoring',
        status: 'scheduled',
        impact: '94% site health'
      }
    ],
    status: 'live'
  },
  {
    id: 'ads',
    title: 'Ad Optimizer',
    description: 'Ad performance and budget recommendations with smart automation rules',
    href: '/workspace/growth-accelerators/ads',
    icon: Megaphone,
    color: 'text-red-600',
    bgGradient: 'from-red-50 via-pink-50 to-rose-50',
    features: [
      'Campaign performance optimization',
      'Budget allocation automation',
      'Audience testing workflows',
      'Creative performance analysis',
      'Bid strategy optimization',
      'ROI tracking and forecasting'
    ],
    metrics: {
      label: 'ROAS Improvement',
      value: '+284%',
      change: '+45%',
      trend: 'up'
    },
    automations: [
      {
        name: 'Smart Budget Optimizer',
        description: 'Automatically reallocates budget to top-performing campaigns',
        status: 'active',
        impact: '+67% efficiency'
      },
      {
        name: 'Audience Expansion',
        description: 'Tests lookalike audiences based on high-value conversions',
        status: 'active',
        impact: '3.2x reach'
      },
      {
        name: 'Creative Fatigue Detector',
        description: 'Pauses underperforming ads and suggests new creatives',
        status: 'paused',
        impact: 'Saves $2.4K/mo'
      }
    ],
    status: 'live'
  },
  {
    id: 'influencer',
    title: 'Influencer Finder',
    description: 'Micro-influencer discovery and outreach with relationship management automation',
    href: '/workspace/growth-accelerators/influencer',
    icon: Users,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 via-violet-50 to-indigo-50',
    features: [
      'AI-powered influencer discovery',
      'Engagement rate analysis',
      'Automated outreach campaigns',
      'Performance tracking',
      'Contract management',
      'ROI calculation and reporting'
    ],
    metrics: {
      label: 'Campaign ROI',
      value: '+456%',
      change: '+89%',
      trend: 'up'
    },
    automations: [
      {
        name: 'Micro-Influencer Scout',
        description: 'Daily discovery of relevant micro-influencers in your niche',
        status: 'active',
        impact: '127 new prospects'
      },
      {
        name: 'Outreach Automation',
        description: 'Personalized email sequences for influencer partnerships',
        status: 'active',
        impact: '34% response rate'
      },
      {
        name: 'Performance Tracker',
        description: 'Monitors influencer campaign metrics and ROI in real-time',
        status: 'scheduled',
        impact: '5.6x engagement'
      }
    ],
    status: 'beta'
  }
];

const growthMetrics = [
  {
    label: 'Total Growth Acceleration',
    value: '+378%',
    change: '+67%',
    icon: Rocket,
    description: 'Overall business growth from accelerators'
  },
  {
    label: 'Active Automations',
    value: '47',
    change: '+12',
    icon: Bot,
    description: 'Running automation workflows'
  },
  {
    label: 'Time Saved Weekly',
    value: '23.4hrs',
    change: '+5.8hrs',
    icon: Clock,
    description: 'Hours saved through automation'
  },
  {
    label: 'Revenue Impact',
    value: '$127K',
    change: '+$34K',
    icon: DollarSign,
    description: 'Monthly revenue from accelerators'
  }
];

const upcomingAutomations = [
  {
    title: 'AI Content Multiplier',
    description: 'Automatically repurpose top-performing content across all platforms',
    eta: 'Next Week',
    impact: 'Expected 3x content output',
    status: 'beta'
  },
  {
    title: 'Predictive Growth Engine',
    description: 'ML-powered forecasting for optimal growth strategy decisions',
    eta: '2 Weeks',
    impact: 'Improved planning accuracy by 85%',
    status: 'coming-soon'
  },
  {
    title: 'Cross-Platform Sync',
    description: 'Unified automation rules across all marketing channels',
    eta: '1 Month',
    impact: 'Seamless multi-channel optimization',
    status: 'coming-soon'
  }
];

const WorkflowDemo = ({ tool }: { tool: AcceleratorTool }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Live Automation Demo</h4>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isPlaying 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Start'}
        </button>
      </div>
      
      <div className="space-y-3">
        {tool.automations.map((automation, index) => (
          <div key={automation.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              automation.status === 'active' 
                ? 'bg-green-500 animate-pulse' 
                : automation.status === 'scheduled'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {automation.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {automation.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                {automation.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GrowthAcceleratorsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'automations' | 'analytics'>('overview');
  const [selectedTool, setSelectedTool] = useState(acceleratorTools[0].id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
              <ArrowUp className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Growth Accelerators
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Proactive growth features that work while you sleep. Advanced automation workflows and AI-powered optimization to scale your business exponentially.
          </p>
        </div>

        {/* Growth Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {growthMetrics.map((metric, index) => (
            <div key={metric.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                  <metric.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-blue-600 text-sm font-semibold bg-blue-50 px-3 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </h3>
              <p className="text-gray-600 text-sm font-medium mb-1">
                {metric.label}
              </p>
              <p className="text-gray-500 text-xs">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'automations', label: 'Automations', icon: Bot },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Accelerator Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {acceleratorTools.map((tool, index) => (
                <Link key={tool.id} href={tool.href}>
                  <div className={`group relative bg-gradient-to-br ${tool.bgGradient} border border-white/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md ${tool.color}`}>
                          <tool.icon className="w-8 h-8" />
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          tool.status === 'live' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : tool.status === 'beta'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {tool.status === 'live' ? 'LIVE' : tool.status === 'beta' ? 'BETA' : 'SOON'}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {tool.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Key Metric */}
                      <div className="bg-white/80 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{tool.metrics.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{tool.metrics.value}</p>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">{tool.metrics.change}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Features List */}
                      <div className="space-y-2 mb-6">
                        {tool.features.slice(0, 3).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                        <div className="text-sm text-gray-500 pt-2">
                          +{tool.features.length - 3} more features
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">
                          {tool.automations.filter(a => a.status === 'active').length} active automations
                        </span>
                        <div className="flex items-center gap-1 text-blue-600 font-semibold">
                          <span className="text-sm">Explore</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Create Automation</p>
                    <p className="text-sm text-gray-600">Set up new growth workflow</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Performance Review</p>
                    <p className="text-sm text-gray-600">Analyze automation results</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">AI Suggestions</p>
                    <p className="text-sm text-gray-600">Get optimization ideas</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="space-y-8">
            {/* Tool Selector */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Active Automation Workflows</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {acceleratorTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTool === tool.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                      <span className="font-semibold text-gray-900">{tool.title}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-2">
                        {tool.automations.filter(a => a.status === 'active').length} active automations
                      </p>
                      <div className="text-xs text-green-600 font-semibold">
                        {tool.metrics.value} impact
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tool Automations */}
            {(() => {
              const tool = acceleratorTools.find(t => t.id === selectedTool);
              return tool ? <WorkflowDemo tool={tool} /> : null;
            })()}

            {/* Upcoming Automations */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Automations</h3>
              <div className="space-y-4">
                {upcomingAutomations.map((automation, index) => (
                  <div key={automation.title} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{automation.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          automation.status === 'beta' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {automation.status === 'beta' ? 'BETA' : 'PLANNED'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{automation.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ETA: {automation.eta}</span>
                        <span className="text-green-600 font-semibold">{automation.impact}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Growth Performance</h3>
                <div className="space-y-4">
                  {acceleratorTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <tool.icon className={`w-6 h-6 ${tool.color}`} />
                        <span className="font-medium text-gray-900">{tool.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{tool.metrics.value}</span>
                        <p className="text-xs text-gray-600">{tool.metrics.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Automation Impact</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="font-medium text-gray-900">Total Time Saved</span>
                    <span className="text-lg font-bold text-green-600">127.8 hours</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="font-medium text-gray-900">Revenue Generated</span>
                    <span className="text-lg font-bold text-blue-600">$389,420</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <span className="font-medium text-gray-900">Tasks Automated</span>
                    <span className="text-lg font-bold text-purple-600">2,847</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">ROI Breakdown by Tool</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {acceleratorTools.map((tool) => (
                  <div key={tool.id} className={`p-6 rounded-2xl border-2 bg-gradient-to-br ${tool.bgGradient}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <tool.icon className={`w-8 h-8 ${tool.color}`} />
                      <h4 className="font-bold text-gray-900">{tool.title}</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Investment</span>
                        <span className="font-semibold">$2,500/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Returns</span>
                        <span className="font-semibold text-green-600">$12,850/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ROI</span>
                        <span className="font-bold text-xl text-green-600">{tool.metrics.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Ready to Accelerate Your Growth?
              </h3>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join thousands of businesses using our Growth Accelerators to automate their success. 
                Start with one tool and scale up as you grow.
              </p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">47</div>
                  <div className="text-sm text-blue-200">Active Automations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">23.4hrs</div>
                  <div className="text-sm text-blue-200">Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">+378%</div>
                  <div className="text-sm text-blue-200">Growth Rate</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/workspace/growth-accelerators/seo">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg text-lg">
                    Start with SEO Booster
                  </button>
                </Link>
                <Link href="/workspace/analytics">
                  <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors text-lg">
                    View All Analytics
                  </button>
                </Link>
              </div>
              
              <div className="mt-6 text-sm text-blue-200">
                🚀 Get started in under 5 minutes • 📈 See results in 24 hours • 💡 Free automation setup
              </div>
            </div>
          </div>
        </div>
        
        {/* Success Stories */}
        <div className="mt-12 bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">SaaS Startup</h4>
              <p className="text-gray-600 text-sm mb-3">
                "SEO Booster increased our organic traffic by 340% in just 3 months."
              </p>
              <div className="text-2xl font-bold text-green-600">+340%</div>
              <div className="text-xs text-gray-500">Organic Traffic</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">E-commerce Brand</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Ad Optimizer cut our customer acquisition cost by 67% while doubling conversions."
              </p>
              <div className="text-2xl font-bold text-red-600">-67%</div>
              <div className="text-xs text-gray-500">Acquisition Cost</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Fitness Coach</h4>
              <p className="text-gray-600 text-sm mb-3">
                "Influencer Finder helped us partner with 127 micro-influencers and 5x our reach."
              </p>
              <div className="text-2xl font-bold text-purple-600">5x</div>
              <div className="text-xs text-gray-500">Reach Increase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}