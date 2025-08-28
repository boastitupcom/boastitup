// apps/web/app/workspace/growth-tools/publishing/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Send, 
  Plus, 
  Filter, 
  Search, 
  Upload,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Globe,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Music as TiktokIcon,
  Image,
  Video,
  FileText,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Brain,
  Sparkles,
  Wand2,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Activity,
  Download,
  Copy
} from 'lucide-react';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: ('instagram' | 'facebook' | 'twitter' | 'youtube' | 'linkedin' | 'tiktok')[];
  scheduledTime: Date;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  mediaType: 'image' | 'video' | 'carousel' | 'text';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  performance?: {
    reach: number;
    impressions: number;
    engagement_rate: number;
  };
  aiOptimized?: boolean;
  hashtags?: string[];
  preview?: string;
}

interface CalendarDay {
  date: Date;
  posts: ScheduledPost[];
  isToday: boolean;
  isCurrentMonth: boolean;
  optimalTime?: string;
  capacity?: 'low' | 'medium' | 'high';
}

interface Platform {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
  posts: number;
  engagement: string;
  nextOptimalTime?: string;
}

interface PublishingMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

const publishingMetrics: PublishingMetric[] = [
  {
    label: 'Posts Scheduled',
    value: '2,847',
    change: '+23%',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-600'
  },
  {
    label: 'Success Rate',
    value: '99.2%',
    change: '+1.2%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    label: 'Avg Engagement',
    value: '4.8%',
    change: '+15%',
    trend: 'up',
    icon: Heart,
    color: 'text-pink-600'
  },
  {
    label: 'Time Saved',
    value: '47h',
    change: '+8h',
    trend: 'up',
    icon: Clock,
    color: 'text-purple-600'
  }
];

const platforms: Platform[] = [
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    connected: true,
    posts: 342,
    engagement: '+12%',
    nextOptimalTime: '6:30 PM'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    connected: true,
    posts: 156,
    engagement: '+8%',
    nextOptimalTime: '1:00 PM'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-400',
    connected: true,
    posts: 445,
    engagement: '+18%',
    nextOptimalTime: '12:30 PM'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    connected: true,
    posts: 67,
    engagement: '+25%',
    nextOptimalTime: '9:00 AM'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    connected: false,
    posts: 23,
    engagement: '+5%',
    nextOptimalTime: '7:00 PM'
  },
  {
    name: 'TikTok',
    icon: TiktokIcon,
    color: 'text-black',
    connected: false,
    posts: 89,
    engagement: '+32%',
    nextOptimalTime: '8:00 PM'
  }
];

const samplePosts: ScheduledPost[] = [
  {
    id: '1',
    content: '🔥 5 Game-Changing HIIT Workouts That Burn Fat Fast! Transform your body in just 20 minutes a day...',
    platforms: ['instagram', 'facebook', 'tiktok'],
    scheduledTime: new Date(2025, 7, 16, 18, 30),
    status: 'scheduled',
    mediaType: 'video',
    aiOptimized: true,
    hashtags: ['#HIIT', '#Fitness', '#WorkoutMotivation', '#FatBurn'],
    preview: 'workout-preview.jpg',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
  },
  {
    id: '2',
    content: 'Mind-blowing nutrition fact: Did you know that timing your protein intake can boost muscle growth by 25%? 💪',
    platforms: ['twitter', 'linkedin'],
    scheduledTime: new Date(2025, 7, 17, 9, 0),
    status: 'scheduled',
    mediaType: 'text',
    aiOptimized: true,
    hashtags: ['#Nutrition', '#Protein', '#MuscleGrowth'],
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
  },
  {
    id: '3',
    content: 'Before & After: Sarah lost 30 pounds with our personalized coaching program! See her incredible transformation 👇',
    platforms: ['instagram', 'facebook'],
    scheduledTime: new Date(2025, 7, 17, 13, 0),
    status: 'published',
    mediaType: 'carousel',
    engagement: { likes: 234, comments: 45, shares: 12, views: 3400 },
    performance: { reach: 12500, impressions: 18200, engagement_rate: 4.2 }
  },
  {
    id: '4',
    content: 'Weekly Meal Prep Sunday! 🥗 Here\'s how to prepare 5 healthy meals in under 2 hours...',
    platforms: ['youtube', 'instagram'],
    scheduledTime: new Date(2025, 7, 18, 19, 0),
    status: 'scheduled',
    mediaType: 'video',
    aiOptimized: false,
    hashtags: ['#MealPrep', '#HealthyEating', '#Nutrition'],
    preview: 'mealprep-preview.jpg',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
  }
];

const aiSuggestions = [
  {
    type: 'timing',
    title: 'Optimal Posting Time',
    description: 'Post at 6:30 PM for 23% better engagement on Instagram',
    confidence: 89,
    impact: 'High'
  },
  {
    type: 'content',
    title: 'Trending Hashtag',
    description: 'Add #TransformationTuesday to increase reach by 15%',
    confidence: 76,
    impact: 'Medium'
  },
  {
    type: 'platform',
    title: 'Cross-Platform Opportunity',
    description: 'This content would perform well on TikTok too',
    confidence: 82,
    impact: 'High'
  }
];

export default function PublishingSchedulingPage() {
  const [currentView, setCurrentView] = useState<'calendar' | 'queue' | 'analytics' | 'bulk'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  // Generate calendar days
  const generateCalendarDays = (month: Date): CalendarDay[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayPosts = samplePosts.filter(post => 
        post.scheduledTime.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        posts: dayPosts,
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: date.getMonth() === monthIndex,
        optimalTime: i % 3 === 0 ? '6:30 PM' : i % 3 === 1 ? '1:00 PM' : '9:00 AM',
        capacity: dayPosts.length === 0 ? 'low' : dayPosts.length <= 2 ? 'medium' : 'high'
      });
    }
    
    return days;
  };

  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(currentMonth));

  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth));
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: Instagram,
      facebook: Facebook,
      twitter: Twitter,
      youtube: Youtube,
      linkedin: Linkedin,
      tiktok: TiktokIcon
    };
    return icons[platform as keyof typeof icons] || Globe;
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: 'text-pink-600',
      facebook: 'text-blue-600',
      twitter: 'text-blue-400',
      youtube: 'text-red-600',
      linkedin: 'text-blue-700',
      tiktok: 'text-black'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'carousel': return MoreHorizontal;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Publishing & Scheduling
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Smart calendar and bulk scheduler for consistent content delivery across all platforms. Powered by AI timing optimization and automated workflows.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {publishingMetrics.map((metric, index) => (
            <div key={metric.label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl`}>
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

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {[
                { id: 'calendar', label: 'Smart Calendar', icon: Calendar },
                { id: 'queue', label: 'Publishing Queue', icon: CalendarClock },
                { id: 'bulk', label: 'Bulk Scheduler', icon: Upload },
                { id: 'analytics', label: 'Performance', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentView === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
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

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Calendar */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button 
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>New Post</span>
                    </button>
                    <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      <span>AI Optimize</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-4">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`relative min-h-[120px] p-3 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        day.isToday
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300'
                          : day.isCurrentMonth
                          ? 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      {/* Date Number */}
                      <div className={`text-sm font-semibold mb-2 ${
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.date.getDate()}
                      </div>

                      {/* Optimal Time Indicator */}
                      {day.isCurrentMonth && day.optimalTime && (
                        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md mb-2">
                          ⭐ {day.optimalTime}
                        </div>
                      )}

                      {/* Posts */}
                      <div className="space-y-1">
                        {day.posts.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            className={`text-xs p-2 rounded-md border-l-4 ${
                              post.status === 'published'
                                ? 'bg-green-50 border-green-400 text-green-800'
                                : post.status === 'scheduled'
                                ? 'bg-blue-50 border-blue-400 text-blue-800'
                                : 'bg-gray-50 border-gray-400 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {post.platforms.map(platform => {
                                const Icon = getPlatformIcon(platform);
                                return (
                                  <Icon key={platform} className={`w-3 h-3 ${getPlatformColor(platform)}`} />
                                );
                              })}
                              {post.aiOptimized && <Sparkles className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <div className="truncate">
                              {post.content.slice(0, 40)}...
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {post.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                        {day.posts.length > 3 && (
                          <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded text-center">
                            +{day.posts.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* Capacity Indicator */}
                      <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${
                        day.capacity === 'low' ? 'bg-green-400' :
                        day.capacity === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} title={`${day.capacity} capacity`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Suggestions */}
              {showAISuggestions && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      <h3 className="font-bold">AI Suggestions</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {suggestion.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            suggestion.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {suggestion.impact}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {suggestion.confidence}% confidence
                          </span>
                          <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                  <h3 className="font-bold">Platform Status</h3>
                </div>
                <div className="p-4 space-y-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${platform.color}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{platform.name}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                platform.connected ? 'bg-green-400' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {platform.posts} posts • {platform.engagement}
                            </div>
                          </div>
                        </div>
                        {platform.nextOptimalTime && (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {platform.nextOptimalTime}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue View */}
        {currentView === 'queue' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Publishing Queue</h2>
                  <p className="text-blue-100 mt-1">Manage and monitor your scheduled content</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  <button className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {samplePosts.map((post) => {
                  const MediaIcon = getMediaTypeIcon(post.mediaType);
                  return (
                    <div key={post.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Media Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <MediaIcon className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(post.status)}`}>
                              {post.status.toUpperCase()}
                            </span>
                            {post.aiOptimized && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Optimized
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {post.mediaType.charAt(0).toUpperCase() + post.mediaType.slice(1)}
                            </span>
                          </div>

                          <p className="text-gray-900 mb-3 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Hashtags */}
                          {post.hashtags && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.hashtags.map((tag, index) => (
                                <span key={index} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Platforms */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Publishing to:</span>
                              {post.platforms.map(platform => {
                                const Icon = getPlatformIcon(platform);
                                return (
                                  <div key={platform} className="flex items-center gap-1">
                                    <Icon className={`w-4 h-4 ${getPlatformColor(platform)}`} />
                                    <span className="text-xs text-gray-600 capitalize">{platform}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Schedule Info */}
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {post.scheduledTime.toLocaleDateString()} at {post.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {post.status === 'published' && post.performance && (
                              <div className="flex items-center gap-4">
                                <span>Reach: {post.performance.reach.toLocaleString()}</span>
                                <span>Engagement: {post.performance.engagement_rate}%</span>
                              </div>
                            )}
                          </div>

                          {/* Engagement Stats for Published Posts */}
                          {post.status === 'published' && post.engagement && (
                            <div className="flex items-center gap-6 mt-3 text-sm">
                              <div className="flex items-center gap-1 text-red-600">
                                <Heart className="w-4 h-4" />
                                <span>{post.engagement.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.engagement.comments}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <Share2 className="w-4 h-4" />
                                <span>{post.engagement.shares}</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-600">
                                <Eye className="w-4 h-4" />
                                <span>{post.engagement.views}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {post.status === 'scheduled' && (
                            <>
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                <Settings className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Publish Now">
                                <Send className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                                <CalendarX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {post.status === 'published' && (
                            <>
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Analytics">
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Duplicate">
                                <Copy className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
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

        {/* Bulk Scheduler View */}
        {currentView === 'bulk' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <h2 className="text-2xl font-bold">Bulk Content Scheduler</h2>
                <p className="text-green-100 mt-1">Upload multiple posts and schedule them with AI optimization</p>
              </div>

              <div className="p-6">
                {/* Drag and Drop Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drop your content here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Support for images, videos, and CSV files with captions
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Choose Files
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      Import from URL
                    </button>
                  </div>
                </div>

                {/* Bulk Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-8 h-8 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Smart Scheduling</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      AI automatically finds optimal posting times for each platform
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Optimize timing</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Avoid conflicts</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Weekend posting</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-8 h-8 text-green-600" />
                      <h3 className="font-bold text-gray-900">Platform Selection</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Choose which platforms to publish to for each post
                    </p>
                    <div className="space-y-2">
                      {platforms.slice(0, 4).map(platform => {
                        const Icon = platform.icon;
                        return (
                          <label key={platform.name} className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" defaultChecked={platform.connected} />
                            <Icon className={`w-4 h-4 ${platform.color}`} />
                            <span className="text-sm">{platform.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wand2 className="w-8 h-8 text-purple-600" />
                      <h3 className="font-bold text-gray-900">AI Enhancement</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Automatically improve captions and add trending hashtags
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Optimize captions</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Add hashtags</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Generate variations</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Preview & Schedule</h3>
                <p className="text-gray-600 mt-1">Review your content before scheduling</p>
              </div>
              
              <div className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Upload content to see preview</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Posts', value: '2,847', change: '+23%', icon: Send, color: 'blue' },
                { label: 'Avg Engagement', value: '4.8%', change: '+0.8%', icon: Heart, color: 'pink' },
                { label: 'Best Time', value: '6:30 PM', change: 'Tue-Thu', icon: Clock, color: 'green' },
                { label: 'Success Rate', value: '99.2%', change: '+0.5%', icon: CheckCircle, color: 'emerald' }
              ].map((metric, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${metric.color}-100 rounded-xl flex items-center justify-center`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                    <span className="text-green-600 text-sm font-semibold">
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

            {/* Platform Performance */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h2 className="text-2xl font-bold">Platform Performance</h2>
                <p className="text-blue-100 mt-1">Compare engagement across all connected platforms</p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {platforms.filter(p => p.connected).map((platform) => {
                    const Icon = platform.icon;
                    const engagementValue = parseFloat(platform.engagement.replace('%', '').replace('+', ''));
                    const barWidth = Math.min((engagementValue / 30) * 100, 100);
                    
                    return (
                      <div key={platform.name} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-8 h-8 ${platform.color}`} />
                            <div>
                              <h3 className="font-bold text-gray-900">{platform.name}</h3>
                              <p className="text-sm text-gray-600">{platform.posts} posts published</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{platform.engagement}</div>
                            <div className="text-sm text-gray-600">Engagement growth</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Engagement Rate</span>
                            <span className="font-semibold">{engagementValue}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${
                                platform.name === 'Instagram' ? 'from-pink-400 to-pink-600' :
                                platform.name === 'Facebook' ? 'from-blue-400 to-blue-600' :
                                platform.name === 'Twitter' ? 'from-blue-300 to-blue-500' :
                                'from-blue-500 to-blue-700'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Best Time</div>
                              <div className="font-semibold">{platform.nextOptimalTime}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Avg Reach</div>
                              <div className="font-semibold">
                                {platform.name === 'Instagram' ? '12.4K' :
                                 platform.name === 'Facebook' ? '8.7K' :
                                 platform.name === 'Twitter' ? '15.2K' : '5.3K'}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Top Content</div>
                              <div className="font-semibold">
                                {platform.name === 'Instagram' ? 'Reels' :
                                 platform.name === 'Facebook' ? 'Videos' :
                                 platform.name === 'Twitter' ? 'Threads' : 'Articles'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Automate Your Content Publishing?
              </h3>
              <p className="text-gray-600 mb-6">
                Save hours every week with AI-powered scheduling and optimization. Never miss the perfect posting time again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Start Scheduling</span>
                </button>
                <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5" />
                  <span>Try AI Optimization</span>
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