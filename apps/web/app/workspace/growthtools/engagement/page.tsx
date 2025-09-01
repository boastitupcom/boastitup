// apps/web/app/workspace/growth-tools/engagement/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Heart, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Send,
  Reply,
  Filter,
  Search,
  Bot,
  Target,
  Zap,
  BarChart3,
  UserPlus,
  Activity,
  Bell,
  Globe,
  Calendar,
  Eye,
  ThumbsUp,
  Share2,
  AtSign,
  Hash,
  Smile
} from 'lucide-react';

interface EngagementMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface Message {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube';
  type: 'comment' | 'dm' | 'mention' | 'review';
  user: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    followers?: string;
  };
  content: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'replied' | 'flagged';
  engagement?: {
    likes?: number;
    replies?: number;
  };
}

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  status: 'active' | 'beta' | 'coming-soon';
}

const engagementMetrics: EngagementMetric[] = [
  {
    label: 'Messages Processed',
    value: '12.3K',
    change: '+23%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-purple-600'
  },
  {
    label: 'Response Rate',
    value: '94.2%',
    change: '+8%',
    trend: 'up',
    icon: Reply,
    color: 'text-green-600'
  },
  {
    label: 'Avg Response Time',
    value: '2.3m',
    change: '-12%',
    trend: 'up',
    icon: Clock,
    color: 'text-blue-600'
  },
  {
    label: 'Community Growth',
    value: '+1.8K',
    change: '+15%',
    trend: 'up',
    icon: UserPlus,
    color: 'text-orange-600'
  }
];

const recentMessages: Message[] = [
  {
    id: '1',
    platform: 'instagram',
    type: 'comment',
    user: {
      name: 'Sarah Johnson',
      handle: '@sarahj_fitness',
      avatar: 'SJ',
      verified: true,
      followers: '23.4K'
    },
    content: 'Love this workout routine! Could you share the nutrition plan that goes with it? 🔥',
    timestamp: '2 minutes ago',
    sentiment: 'positive',
    priority: 'high',
    status: 'unread',
    engagement: { likes: 12, replies: 3 }
  },
  {
    id: '2',
    platform: 'facebook',
    type: 'dm',
    user: {
      name: 'Mike Chen',
      handle: '@mikefitnesscoach',
      avatar: 'MC',
      followers: '8.2K'
    },
    content: 'Hi! I\'m interested in your coaching program. What packages do you offer?',
    timestamp: '5 minutes ago',
    sentiment: 'positive',
    priority: 'high',
    status: 'unread'
  },
  {
    id: '3',
    platform: 'twitter',
    type: 'mention',
    user: {
      name: 'FitnessDaily',
      handle: '@fitnessdaily',
      avatar: 'FD',
      verified: true,
      followers: '156K'
    },
    content: 'Great article on HIIT workouts! Our readers would love this. Mind if we share?',
    timestamp: '12 minutes ago',
    sentiment: 'positive',
    priority: 'medium',
    status: 'read'
  },
  {
    id: '4',
    platform: 'youtube',
    type: 'comment',
    user: {
      name: 'Alex Rodriguez',
      handle: '@alexfitness23',
      avatar: 'AR'
    },
    content: 'This helped me lose 15 pounds! Thank you so much for the detailed explanations.',
    timestamp: '18 minutes ago',
    sentiment: 'positive',
    priority: 'medium',
    status: 'replied'
  },
  {
    id: '5',
    platform: 'instagram',
    type: 'comment',
    user: {
      name: 'Emma Wilson',
      handle: '@emmawilson_fit',
      avatar: 'EW'
    },
    content: 'The form seems wrong in this exercise. Could cause injury if done incorrectly.',
    timestamp: '25 minutes ago',
    sentiment: 'negative',
    priority: 'high',
    status: 'flagged'
  }
];

const featureCards: FeatureCard[] = [
  {
    title: 'Unified Inbox',
    description: 'Manage all your social media messages, comments, and mentions in one central dashboard',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'from-purple-50 via-violet-50 to-purple-50',
    features: [
      'Cross-platform message aggregation',
      'Smart priority sorting',
      'Bulk actions and responses',
      'Message threading and context',
      'Team collaboration tools'
    ],
    status: 'active'
  },
  {
    title: 'AI Response Assistant',
    description: 'Get intelligent response suggestions that match your brand voice and context',
    icon: Bot,
    color: 'text-indigo-600',
    bgColor: 'from-indigo-50 via-blue-50 to-indigo-50',
    features: [
      'Context-aware response generation',
      'Brand voice consistency',
      'Sentiment-based suggestions',
      'Multi-language support',
      'Custom response templates'
    ],
    status: 'beta'
  },
  {
    title: 'Community Analytics',
    description: 'Track engagement patterns, sentiment trends, and community health metrics',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'from-green-50 via-emerald-50 to-green-50',
    features: [
      'Sentiment analysis dashboard',
      'Engagement trend tracking',
      'Influencer identification',
      'Community growth metrics',
      'Response time analytics'
    ],
    status: 'active'
  }
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube
};

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-yellow-100 text-yellow-800',
  negative: 'bg-red-100 text-red-800'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

export default function EngagementHubPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'analytics'>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: 'text-pink-600',
      facebook: 'text-blue-600',
      twitter: 'text-blue-400',
      youtube: 'text-red-600'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Bell className="w-4 h-4 text-orange-500" />;
      case 'read': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Engagement Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unified inbox and community management for authentic customer relationships. Never miss a message, comment, or opportunity to connect.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'inbox', label: 'Live Inbox', icon: MessageSquare },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {engagementMetrics.map((metric, index) => (
                <div key={metric.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      metric.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featureCards.map((feature, index) => (
                <div key={feature.title} className={`group relative bg-gradient-to-br ${feature.bgColor} border border-white/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-3xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md ${feature.color}`}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        feature.status === 'active' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : feature.status === 'beta'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {feature.status === 'active' ? 'LIVE' : feature.status === 'beta' ? 'BETA' : 'COMING SOON'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {feature.features.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Activity className="w-4 h-4" />
                        <span>Real-time updates</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            {/* Inbox Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Live Message Feed</h2>
                <div className="flex items-center gap-4">
                  {/* Platform Filter */}
                  <select 
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  >
                    <option value="all">All Platforms</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                  </select>
                  
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="space-y-4">
                {recentMessages.map((message) => {
                  const PlatformIcon = platformIcons[message.platform];
                  return (
                    <div key={message.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {message.user.avatar}
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{message.user.name}</h4>
                            {message.user.verified && <Star className="w-4 h-4 text-blue-500" />}
                            <span className="text-gray-500 text-sm">{message.user.handle}</span>
                            {message.user.followers && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {message.user.followers} followers
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{message.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {/* Platform */}
                            <div className="flex items-center gap-1">
                              <PlatformIcon className={`w-4 h-4 ${getPlatformColor(message.platform)}`} />
                              <span className="text-gray-500 capitalize">{message.platform}</span>
                            </div>
                            
                            {/* Type */}
                            <span className="text-gray-500 capitalize">{message.type}</span>
                            
                            {/* Sentiment */}
                            <span className={`px-2 py-1 rounded-full text-xs ${sentimentColors[message.sentiment]}`}>
                              {message.sentiment}
                            </span>
                            
                            {/* Priority */}
                            <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[message.priority]}`}>
                              {message.priority} priority
                            </span>
                            
                            {/* Timestamp */}
                            <span className="text-gray-500">{message.timestamp}</span>
                          </div>
                          
                          {/* Engagement */}
                          {message.engagement && (
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {message.engagement.likes && (
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{message.engagement.likes}</span>
                                </div>
                              )}
                              {message.engagement.replies && (
                                <div className="flex items-center gap-1">
                                  <Reply className="w-4 h-4" />
                                  <span>{message.engagement.replies}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <button className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-colors">
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sentiment Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">Positive</span>
                      <span className="text-gray-900 font-semibold">67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600 font-medium">Neutral</span>
                      <span className="text-gray-900 font-semibold">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-600 font-medium">Negative</span>
                      <span className="text-gray-900 font-semibold">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Response Time Analytics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Response Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">2.3m</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">94.2%</div>
                      <div className="text-sm text-gray-600">Response Rate</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">847</div>
                      <div className="text-sm text-gray-600">Messages Today</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">23</div>
                      <div className="text-sm text-gray-600">Pending Replies</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Community Engagement?
              </h3>
              <p className="text-gray-600 mb-6">
                Never miss another opportunity to connect with your audience. Start building stronger relationships today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md">
                  Connect Your Accounts
                </button>
                <Link href="/workspace/growth-tools">
                  <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Back to Growth Tools
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