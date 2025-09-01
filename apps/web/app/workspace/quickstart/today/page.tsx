// apps/web/app/workspace/quickstart/today/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Brain,
  Sparkles,
  Calendar,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Activity,
  Eye,
  Heart
} from 'lucide-react';

// Types
interface PriorityTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium';
  category: 'content' | 'engagement' | 'analytics' | 'strategy';
  estimatedTime: string;
  impact: 'high' | 'medium' | 'low';
  aiConfidence: number;
  dueBy?: string;
  status: 'pending' | 'in-progress' | 'completed';
  metrics?: {
    current: number;
    target: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface TodayMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

// Dummy Data
const todayMetrics: TodayMetric[] = [
  {
    label: 'Today\'s Engagement',
    value: '1,247',
    change: '+23%',
    trend: 'up',
    icon: Heart,
    color: 'text-red-500'
  },
  {
    label: 'Posts Scheduled',
    value: '7',
    change: '+2',
    trend: 'up',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    label: 'Reach',
    value: '15.2K',
    change: '+8%',
    trend: 'up',
    icon: Eye,
    color: 'text-purple-500'
  },
  {
    label: 'Response Rate',
    value: '94%',
    change: '-2%',
    trend: 'down',
    icon: MessageSquare,
    color: 'text-green-500'
  }
];

const priorityTasks: PriorityTask[] = [
  {
    id: '1',
    title: 'Respond to 12 High-Value Comments',
    description: 'Your latest Instagram post has comments from potential customers and influencers requiring immediate attention.',
    priority: 'urgent',
    category: 'engagement',
    estimatedTime: '15 min',
    impact: 'high',
    aiConfidence: 95,
    dueBy: 'Next 2 hours',
    status: 'pending',
    metrics: {
      current: 12,
      target: 24,
      change: 8,
      trend: 'up'
    }
  },
  {
    id: '2',
    title: 'Optimize Tomorrow\'s LinkedIn Post',
    description: 'AI detected your LinkedIn content performs 40% better when posted at 8:30 AM with industry hashtags.',
    priority: 'urgent',
    category: 'content',
    estimatedTime: '10 min',
    impact: 'high',
    aiConfidence: 87,
    dueBy: 'Before 6 PM today',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Review Weekly Analytics Report',
    description: 'Your engagement patterns show unusual spikes. Review the auto-generated report to identify trends.',
    priority: 'high',
    category: 'analytics',
    estimatedTime: '20 min',
    impact: 'medium',
    aiConfidence: 78,
    status: 'pending'
  },
  {
    id: '4',
    title: 'Create Content for Trending Topic',
    description: '#TransformationTuesday is trending in your niche. Create content to capitalize on this opportunity.',
    priority: 'medium',
    category: 'content',
    estimatedTime: '30 min',
    impact: 'medium',
    aiConfidence: 82,
    dueBy: 'End of today',
    status: 'pending'
  }
];

const aiInsights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Instagram Reels Opportunity',
    description: 'Your audience is 3x more engaged with video content. Create more Reels for maximum reach.',
    confidence: 92,
    impact: 'high',
    timeframe: 'This week'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Posting Frequency Gap',
    description: 'You haven\'t posted on TikTok in 3 days. Consistency is key for algorithm performance.',
    confidence: 89,
    impact: 'medium',
    timeframe: 'Today'
  },
  {
    id: '3',
    type: 'trend',
    title: 'Audience Growth Acceleration',
    description: 'Your follower growth rate increased 45% this month. Double down on current content strategy.',
    confidence: 94,
    impact: 'high',
    timeframe: 'This month'
  }
];

const quickActions = [
  { 
    name: 'Bulk Schedule Posts', 
    icon: Calendar, 
    href: '/workspace/growthtools/publishing',
    description: 'Queue up content for the week'
  },
  { 
    name: 'Engagement Hub', 
    icon: MessageSquare, 
    href: '/workspace/growthtools/engagement',
    description: 'Respond to comments and DMs'
  },
  { 
    name: 'Analytics Dashboard', 
    icon: BarChart3, 
    href: '/workspace/analytics',
    description: 'Deep dive into performance'
  },
  { 
    name: 'Content Ideas', 
    icon: Lightbulb, 
    href: '/workspace/content-studio/ai-assistant',
    description: 'AI-generated content suggestions'
  }
];

export default function TodaysFocusPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => [...prev, taskId]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'warning': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      case 'trend': return Activity;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-red-50 border-red-200 text-red-800';
      case 'recommendation': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'trend': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const pendingTasks = priorityTasks.filter(task => !completedTasks.includes(task.id));
  const completedTasksList = priorityTasks.filter(task => completedTasks.includes(task.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Today's Focus
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-prioritized tasks and insights tailored to your current business needs
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              3 urgent tasks
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">Last updated: 2 minutes ago</span>
          </div>
        </div>

        {/* Today's Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {todayMetrics.map((metric, index) => (
            <div key={metric.label} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
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
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Priority Tasks</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                      {pendingTasks.length} pending
                    </span>
                    {completedTasksList.length > 0 && (
                      <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="text-sm bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
                      >
                        {showCompleted ? 'Hide' : 'Show'} completed ({completedTasksList.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <div key={task.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          className="flex-shrink-0 w-6 h-6 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-colors mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {task.title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {task.description}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold border ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {task.estimatedTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Brain className="w-4 h-4" />
                                {task.aiConfidence}% confidence
                              </span>
                              {task.dueBy && (
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-4 h-4" />
                                  Due: {task.dueBy}
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.impact === 'high' ? 'bg-green-100 text-green-700' :
                              task.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.impact} impact
                            </span>
                          </div>

                          {task.metrics && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress: {task.metrics.current}/{task.metrics.target}</span>
                                <span className="flex items-center gap-1">
                                  {task.metrics.trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                  )}
                                  +{task.metrics.change} today
                                </span>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-600 h-2 rounded-full" 
                                  style={{ width: `${(task.metrics.current / task.metrics.target) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {showCompleted && completedTasksList.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">Completed Today</h4>
                      {completedTasksList.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 opacity-70">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 line-through">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Quick Actions */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="text-lg font-bold">AI Insights</h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {aiInsights.map((insight) => {
                    const IconComponent = getInsightIcon(insight.type);
                    return (
                      <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getInsightColor(insight.type)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{insight.confidence}% confidence</span>
                              <span>•</span>
                              <span>{insight.impact} impact</span>
                              <span>•</span>
                              <span>{insight.timeframe}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Quick Actions</h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link key={action.name} href={action.href}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <action.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors block">
                            {action.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {action.description}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <Link href="/workspace/quickstart" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Quick Start
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <Link href="/workspace/quickstart/wins" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Next: Quick Wins
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}