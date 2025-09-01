// apps/web/app/workspace/quickstart/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Target, 
  CheckCircle, 
  Activity, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

interface QuickStartCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  badge?: string;
  status?: 'new' | 'urgent';
  estimatedTime?: string;
}

const quickStartCards: QuickStartCard[] = [
  {
    title: "Today's Focus",
    description: 'AI-prioritized tasks and insights tailored to your current business needs',
    href: '/workspace/quickstart/today',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'from-orange-50 to-red-50',
    badge: '3 urgent',
    status: 'urgent',
    estimatedTime: '5 min'
  },
  {
    title: 'Quick Wins',
    description: 'One-click optimizations that can boost your performance immediately',
    href: '/workspace/quickstart/wins',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'from-green-50 to-emerald-50',
    status: 'new',
    estimatedTime: '2 min'
  },
  {
    title: 'Performance Snapshot',
    description: 'Traffic light system overview of your key metrics and health indicators',
    href: '/workspace/quickstart/snapshot',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'from-purple-50 to-violet-50',
    estimatedTime: '3 min'
  },
  {
    title: 'Action Items',
    description: 'Clear next steps based on your data, not just raw analytics',
    href: '/workspace/quickstart/actions',
    icon: CheckCircle,
    color: 'text-indigo-600',
    bgColor: 'from-indigo-50 to-blue-50',
    estimatedTime: '4 min'
  }
];

const recentInsights = [
  {
    title: 'Instagram engagement up 23%',
    description: 'Your recent video content is performing exceptionally well',
    time: '2 hours ago',
    type: 'positive'
  },
  {
    title: 'TikTok posting frequency needs attention',
    description: 'Consistency gap detected - 3 days since last post',
    time: '4 hours ago',
    type: 'warning'
  },
  {
    title: 'LinkedIn reach expanded',
    description: 'Your thought leadership content reached 2.4K new professionals',
    time: '1 day ago',
    type: 'positive'
  }
];

const quickActions = [
  { name: 'Schedule Posts', icon: Calendar, href: '/workspace/growth-tools/publishing' },
  { name: 'View Analytics', icon: BarChart3, href: '/workspace/analytics' },
  { name: 'Team Collaboration', icon: Users, href: '/workspace/settings/team' },
  { name: 'Content Ideas', icon: Lightbulb, href: '/workspace/content-studio/ai-assistant' }
];

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quick Start Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Immediate value for time-pressed founders. Get insights, optimizations, and actionable next steps in minutes, not hours.
          </p>
        </div>

        {/* Main Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {quickStartCards.map((card, index) => (
            <Link key={card.title} href={card.href}>
              <div className={`group relative bg-gradient-to-br ${card.bgColor} border border-white/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-md ${card.color}`}>
                      <card.icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {card.status && (
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          card.status === 'urgent' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {card.status === 'urgent' ? 'URGENT' : 'NEW'}
                        </span>
                      )}
                      {card.badge && (
                        <span className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full font-medium border border-red-200">
                          {card.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{card.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Two Column Layout for Insights and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Insights */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Recent Insights</h2>
              </div>
              <p className="mt-2 text-blue-100">
                AI-powered observations about your social media performance
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      insight.type === 'positive' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {insight.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {insight.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/workspace/analytics" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                View All Analytics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6" />
                <h2 className="text-xl font-bold">Quick Actions</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={action.name} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <action.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {action.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Our onboarding team can help you set up your workspace and connect your social media accounts for maximum impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md">
                  Schedule Onboarding Call
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}