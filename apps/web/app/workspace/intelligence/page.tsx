// apps/web/app/workspace/intelligence/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart,
  Eye,
  Target,
  Play,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Brain,
  AlertTriangle,
  Clock,
  Lightbulb,
  CheckCircle,
  Activity
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  icon: React.ComponentType<any>;
}

interface TrendingItemProps {
  name: string;
  hashtags: string;
  change: string;
  trend: 'up' | 'down';
  status: 'viral' | 'steady' | 'momentum';
}

interface CompetitorProps {
  name: string;
  percentage: string;
  color: string;
}

interface RecommendationProps {
  title: string;
  description: string;
  confidence: string;
  timeline: string;
  reach: string;
  priority: 'high' | 'medium';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, color, icon: Icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const TrendingItem: React.FC<TrendingItemProps> = ({ name, hashtags, change, trend, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'viral': return 'bg-red-100 text-red-700 border-red-200';
      case 'steady': return 'bg-green-100 text-green-700 border-green-200';
      case 'momentum': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{hashtags}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor()}`}>
          {status.toUpperCase()}
        </span>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
    </div>
  );
};

const CompetitorBar: React.FC<CompetitorProps> = ({ name, percentage, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-700 font-medium">{name}</span>
      <span className="text-gray-900 font-semibold">{percentage}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full ${color}`}
        style={{ width: percentage }}
      ></div>
    </div>
  </div>
);

const RecommendationCard: React.FC<RecommendationProps> = ({ title, description, confidence, timeline, reach, priority }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-8 h-8 rounded-lg ${
        priority === 'high' ? 'bg-red-100' : 'bg-green-100'
      } flex items-center justify-center`}>
        <Lightbulb className={`w-4 h-4 ${
          priority === 'high' ? 'text-red-600' : 'text-green-600'
        }`} />
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}>
        {confidence} Confidence
      </span>
    </div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>Projected Reach: {reach}</span>
      <span>Timeline: {timeline}</span>
    </div>
  </div>
);

export default function IntelligencePage() {
  const pulseCheckMetrics = [
    { title: 'Engagement Rate', value: '8.7%', change: '+2.3%', trend: 'up' as const, color: 'bg-emerald-500', icon: Heart },
    { title: 'Virality Score', value: '94/100', change: '+12', trend: 'up' as const, color: 'bg-green-500', icon: TrendingUp }
  ];

  const vibeShiftMetrics = [
    { title: 'Organic Reach', value: '124.5K', change: '+9.7%', trend: 'up' as const, color: 'bg-blue-500', icon: Eye },
    { title: 'Community Growth', value: '+2.4K', change: '+18%', trend: 'up' as const, color: 'bg-indigo-500', icon: Target }
  ];

  const trendingItems = [
    { name: 'Pilates Core Challenge', hashtags: '#PilatesCoreChallenge #GetStronger #CoreStrength', change: '+847%', trend: 'up' as const, status: 'viral' as const },
    { name: 'Mindful Movement', hashtags: '#MindfulMovement #SelfCare #MindfulnessMeditation', change: '+234%', trend: 'up' as const, status: 'momentum' as const },
    { name: 'Compact Home Gym', hashtags: '#PerfectFlow #WorkFitness #CompactWorkout', change: '+67%', trend: 'up' as const, status: 'steady' as const }
  ];

  const competitors = [
    { name: 'FitLeisure', percentage: '47.2%', color: 'bg-pink-400' },
    { name: 'Lululemon', percentage: '34.8%', color: 'bg-cyan-400' },
    { name: 'Nike', percentage: '29.1%', color: 'bg-cyan-500' },
    { name: 'Alo Yoga', percentage: '24.6%', color: 'bg-cyan-600' }
  ];

  const recommendations = [
    {
      title: 'Launch "28-Day Pilates Journey"',
      description: 'Capitalize on the pilates trend with a structured, beginner-friendly series featuring real member transformations and daily check-ins.',
      confidence: '84%',
      timeline: '2 weeks',
      reach: '12.4K',
      priority: 'high' as const
    },
    {
      title: 'Micro-Influencer Authenticity Push',
      description: 'Partner with 15-30 micro-influencers (10K-100K followers) for genuine product reviews and workout content.',
      confidence: '72%',
      timeline: '3 weeks',
      reach: '1.2M',
      priority: 'medium' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FitLeisure Creative Command
              </h1>
              <p className="text-gray-600 mt-1">
                Strategic Content Intelligence Dashboard
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">5 Trends Surging</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Refresh</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* The Pulse Check */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">The Pulse Check</h2>
              <span className="text-sm text-gray-500">Are we resonating?</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {pulseCheckMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">AI Content Insight</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your engagement spike correlates with authentic fitness journey content. The community is responding to vulnerability and real transformation stories over polished content ratios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Vibe Shift */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">The Vibe Shift</h2>
              <span className="text-sm text-gray-500">What's trending now?</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {vibeShiftMetrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
            
            <div className="space-y-3">
              {trendingItems.map((item, index) => (
                <TrendingItem key={index} {...item} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How do we compare? */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">How do we compare?</h2>
            </div>
            
            <div className="space-y-6">
              {competitors.map((competitor, index) => (
                <CompetitorBar key={index} {...competitor} />
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Lululemon launched #MindfulMovement campaign - 2.3M views in 48hrs</span>
                <span className="text-red-600 font-semibold">Viral</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Alo Yoga partnering with meditation app Headspace</span>
                <span className="text-orange-600 font-semibold">Momentum</span>
              </div>
            </div>
          </div>

          {/* What's our next move? */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Play className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">What's our next move?</h2>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <RecommendationCard key={index} {...rec} />
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight Bar */}
        <div className="mt-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Strategic Intelligence Insight</h3>
              <p className="text-emerald-100 leading-relaxed">
                Pilates is having a renaissance moment driven by accessibility and core-focused results. Consider partnering with 
                Pilates instructors to create content for the pilates space for authentic content creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}