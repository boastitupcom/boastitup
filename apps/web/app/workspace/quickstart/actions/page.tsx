// apps/web/app/workspace/quickstart/actions/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  ArrowRight, 
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Eye,
  Hash,
  Share2,
  Play,
  Pause,
  Filter,
  SortAsc,
  Brain,
  Zap,
  Star
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'engagement' | 'analytics' | 'growth' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'complex';
  estimatedTime: string;
  potentialImpact: string;
  status: 'pending' | 'in-progress' | 'completed';
  aiGenerated: boolean;
  dueDate?: string;
  relatedMetrics?: string[];
  steps: string[];
  dependencies?: string[];
}

const actionItems: ActionItem[] = [
  {
    id: '1',
    title: 'Create Instagram Reels Content Calendar',
    description: 'Plan and schedule 14 Reels for the next two weeks based on trending topics and your audience preferences.',
    category: 'content',
    priority: 'high',
    effort: 'moderate',
    estimatedTime: '2 hours',
    potentialImpact: '+45% reach',
    status: 'pending',
    aiGenerated: true,
    dueDate: '2025-08-18',
    relatedMetrics: ['Reach', 'Engagement Rate'],
    steps: [
      'Research trending hashtags in your niche',
      'Identify 14 content topics',
      'Create content briefs for each Reel',
      'Schedule publishing times',
      'Set up performance tracking'
    ]
  },
  {
    id: '2',
    title: 'Implement Comment Response Templates',
    description: 'Create and set up automated response templates for common questions to improve response time from 4.2h to under 1h.',
    category: 'engagement',
    priority: 'high',
    effort: 'quick',
    estimatedTime: '45 minutes',
    potentialImpact: '+300% response speed',
    status: 'in-progress',
    aiGenerated: true,
    dueDate: '2025-08-17',
    relatedMetrics: ['Response Time', 'Customer Satisfaction'],
    steps: [
      'Analyze most common questions',
      'Write 10 template responses',
      'Set up automation rules',
      'Test response system',
      'Train team on new process'
    ]
  },
  {
    id: '3',
    title: 'Optimize Post Timing Strategy',
    description: 'Analyze your audience activity patterns and adjust posting schedule to maximize engagement during peak hours.',
    category: 'optimization',
    priority: 'medium',
    effort: 'quick',
    estimatedTime: '30 minutes',
    potentialImpact: '+25% engagement',
    status: 'pending',
    aiGenerated: true,
    relatedMetrics: ['Engagement Rate', 'Reach'],
    steps: [
      'Review audience insights data',
      'Identify peak activity times',
      'Update posting schedule',
      'Set up automated posting',
      'Monitor performance changes'
    ]
  },
  {
    id: '4',
    title: 'Launch User-Generated Content Campaign',
    description: 'Create a hashtag campaign to encourage followers to share content featuring your products or services.',
    category: 'growth',
    priority: 'medium',
    effort: 'complex',
    estimatedTime: '4 hours',
    potentialImpact: '+60% brand mentions',
    status: 'pending',
    aiGenerated: false,
    dueDate: '2025-08-25',
    relatedMetrics: ['Brand Mentions', 'Follower Growth'],
    steps: [
      'Design campaign concept and hashtag',
      'Create campaign guidelines',
      'Design promotional materials',
      'Launch campaign announcement',
      'Monitor and engage with submissions',
      'Feature best submissions'
    ],
    dependencies: ['Content calendar must be updated']
  },
  {
    id: '5',
    title: 'Set Up Competitor Monitoring Dashboard',
    description: 'Create a system to track competitor content performance and identify opportunities for your own content strategy.',
    category: 'analytics',
    priority: 'low',
    effort: 'moderate',
    estimatedTime: '1.5 hours',
    potentialImpact: '+20% competitive advantage',
    status: 'pending',
    aiGenerated: true,
    relatedMetrics: ['Content Performance', 'Market Share'],
    steps: [
      'Identify top 5 competitors',
      'Set up monitoring tools',
      'Create reporting dashboard',
      'Establish weekly review process',
      'Document insights and opportunities'
    ]
  },
  {
    id: '6',
    title: 'Implement Cross-Platform Content Repurposing',
    description: 'Create a workflow to automatically adapt content for different platforms (Instagram to TikTok, LinkedIn, etc.).',
    category: 'optimization',
    priority: 'medium',
    effort: 'moderate',
    estimatedTime: '2.5 hours',
    potentialImpact: '+150% content output',
    status: 'completed',
    aiGenerated: true,
    relatedMetrics: ['Content Volume', 'Platform Reach'],
    steps: [
      'Map content formats by platform',
      'Create adaptation templates',
      'Set up automation workflows',
      'Test cross-platform posting',
      'Optimize based on performance'
    ]
  }
];

const categoryIcons = {
  content: Calendar,
  engagement: MessageSquare,
  analytics: BarChart3,
  growth: TrendingUp,
  optimization: Target
};

const categoryColors = {
  content: 'bg-blue-50 text-blue-700 border-blue-200',
  engagement: 'bg-green-50 text-green-700 border-green-200',
  analytics: 'bg-purple-50 text-purple-700 border-purple-200',
  growth: 'bg-orange-50 text-orange-700 border-orange-200',
  optimization: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export default function ActionItemsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [showCompleted, setShowCompleted] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'quick': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'complex': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Play;
      case 'pending': return Pause;
      default: return Clock;
    }
  };

  const filteredItems = actionItems
    .filter(item => {
      if (filter === 'all') return showCompleted || item.status !== 'completed';
      return (showCompleted || item.status !== 'completed') && 
             (filter === 'ai' ? item.aiGenerated : item.category === filter);
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      }
      if (sortBy === 'effort') {
        const effortOrder = { quick: 1, moderate: 2, complex: 3 };
        return effortOrder[a.effort as keyof typeof effortOrder] - effortOrder[b.effort as keyof typeof effortOrder];
      }
      if (sortBy === 'impact') {
        return b.potentialImpact.localeCompare(a.potentialImpact);
      }
      return 0;
    });

  const pendingItems = actionItems.filter(item => item.status === 'pending');
  const inProgressItems = actionItems.filter(item => item.status === 'in-progress');
  const completedItems = actionItems.filter(item => item.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Action Items
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Clear next steps based on your data, not just raw analytics
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
              <Target className="w-4 h-4" />
              {pendingItems.length} pending
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
              <Play className="w-4 h-4" />
              {inProgressItems.length} in progress
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
              <CheckCircle className="w-4 h-4" />
              {completedItems.length} completed
            </span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="content">Content</option>
                  <option value="engagement">Engagement</option>
                  <option value="analytics">Analytics</option>
                  <option value="growth">Growth</option>
                  <option value="optimization">Optimization</option>
                  <option value="ai">AI Generated</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="priority">Priority</option>
                  <option value="effort">Effort Required</option>
                  <option value="impact">Potential Impact</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Show completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const IconComponent = categoryIcons[item.category];
            const StatusIcon = getStatusIcon(item.status);
            const isExpanded = expandedItem === item.id;

            return (
              <div key={item.id} className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
                item.status === 'completed' ? 'opacity-75' : ''
              }`}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[item.category]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            {item.aiGenerated && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                <Brain className="w-3 h-3" />
                                AI
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {item.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${
                            item.status === 'completed' ? 'text-green-600' :
                            item.status === 'in-progress' ? 'text-orange-600' :
                            'text-gray-400'
                          }`} />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityColor(item.priority)}`}>
                          {item.priority} priority
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEffortColor(item.effort)}`}>
                          {item.effort} effort
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                          {item.estimatedTime}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">
                          {item.potentialImpact}
                        </span>
                        {item.dueDate && (
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {item.relatedMetrics && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-500">Impacts:</span>
                          {item.relatedMetrics.map((metric, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                              {metric}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Action Steps'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {item.status === 'pending' && (
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                              Start Task
                            </button>
                          )}
                          {item.status === 'in-progress' && (
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                              Mark Complete
                            </button>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Action Steps:</h4>
                      <div className="space-y-2">
                        {item.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                      
                      {item.dependencies && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-yellow-800 mb-1">Dependencies:</h5>
                          <ul className="text-sm text-yellow-700">
                            {item.dependencies.map((dep, index) => (
                              <li key={index}>• {dep}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No action items found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new recommendations.
            </p>
            <button
              onClick={() => {
                setFilter('all');
                setShowCompleted(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <Link href="/workspace/quickstart/snapshot" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back: Performance Snapshot
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <Link href="/workspace/quickstart" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Return to Quick Start Hub
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}