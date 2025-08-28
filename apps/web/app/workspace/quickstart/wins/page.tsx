// apps/web/app/workspace/quickstart/wins/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  Zap, 
  ArrowRight, 
  Clock, 
  TrendingUp,
  Target,
  Sparkles,
  Play,
  Award,
  Lightbulb,
  Settings,
  BarChart3,
  Users,
  Calendar,
  Hash,
  Image,
  Share2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'automation' | 'engagement' | 'content';
  impact: 'high' | 'medium' | 'low';
  effort: 'one-click' | 'minimal' | 'moderate';
  estimatedTime: string;
  potentialGain: string;
  status: 'available' | 'applied' | 'in-progress';
  actionType: 'toggle' | 'configure' | 'review';
  aiConfidence: number;
  steps?: string[];
}

const quickWins: QuickWin[] = [
  {
    id: '1',
    title: 'Enable Auto-Posting During Peak Hours',
    description: 'Automatically schedule your content during your audience\'s most active times. AI detected 6-8 PM gets 40% more engagement.',
    category: 'automation',
    impact: 'high',
    effort: 'one-click',
    estimatedTime: '30 seconds',
    potentialGain: '+40% engagement',
    status: 'available',
    actionType: 'toggle',
    aiConfidence: 94
  },
  {
    id: '2',
    title: 'Add Trending Hashtags to Scheduled Posts',
    description: 'Automatically append trending industry hashtags to your upcoming posts. Currently 5 posts can benefit.',
    category: 'optimization',
    impact: 'high',
    effort: 'one-click',
    estimatedTime: '1 minute',
    potentialGain: '+25% reach',
    status: 'available',
    actionType: 'toggle',
    aiConfidence: 87
  },
  {
    id: '3',
    title: 'Turn On Smart Comment Prioritization',
    description: 'AI will highlight comments from verified accounts, potential customers, and influencers first.',
    category: 'engagement',
    impact: 'medium',
    effort: 'one-click',
    estimatedTime: '15 seconds',
    potentialGain: '+60% response rate',
    status: 'available',
    actionType: 'toggle',
    aiConfidence: 91
  },
  {
    id: '4',
    title: 'Enable Cross-Platform Content Adaptation',
    description: 'Automatically adapt your content format for different platforms. Instagram captions become Twitter threads.',
    category: 'automation',
    impact: 'high',
    effort: 'minimal',
    estimatedTime: '2 minutes',
    potentialGain: '+200% content output',
    status: 'available',
    actionType: 'configure',
    aiConfidence: 85
  },
  {
    id: '5',
    title: 'Activate Competitor Mention Alerts',
    description: 'Get notified when your competitors are mentioned so you can engage in relevant conversations.',
    category: 'engagement',
    impact: 'medium',
    effort: 'minimal',
    estimatedTime: '3 minutes',
    potentialGain: '+50% brand visibility',
    status: 'applied',
    actionType: 'configure',
    aiConfidence: 78
  },
  {
    id: '6',
    title: 'Optimize Image Alt Text for Accessibility',
    description: 'Automatically generate and add alt text to your images for better accessibility and SEO.',
    category: 'optimization',
    impact: 'medium',
    effort: 'one-click',
    estimatedTime: '30 seconds',
    potentialGain: '+15% organic reach',
    status: 'available',
    actionType: 'toggle',
    aiConfidence: 82
  },
  {
    id: '7',
    title: 'Enable Smart Emoji Suggestions',
    description: 'AI suggests relevant emojis based on your content context to increase engagement rates.',
    category: 'content',
    impact: 'low',
    effort: 'one-click',
    estimatedTime: '15 seconds',
    potentialGain: '+12% engagement',
    status: 'available',
    actionType: 'toggle',
    aiConfidence: 76
  },
  {
    id: '8',
    title: 'Set Up Automated Thank You Messages',
    description: 'Send personalized thank you messages to new followers within 1 hour of following.',
    category: 'automation',
    impact: 'medium',
    effort: 'minimal',
    estimatedTime: '5 minutes',
    potentialGain: '+35% follower retention',
    status: 'available',
    actionType: 'configure',
    aiConfidence: 88
  }
];

const categoryIcons = {
  optimization: BarChart3,
  automation: Zap,
  engagement: Users,
  content: Image
};

const categoryColors = {
  optimization: 'bg-blue-50 text-blue-700 border-blue-200',
  automation: 'bg-purple-50 text-purple-700 border-purple-200',
  engagement: 'bg-green-50 text-green-700 border-green-200',
  content: 'bg-orange-50 text-orange-700 border-orange-200'
};

export default function QuickWinsPage() {
  const [appliedWins, setAppliedWins] = useState<string[]>(['5']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showApplied, setShowApplied] = useState(false);

  const handleApplyWin = (winId: string) => {
    setAppliedWins(prev => [...prev, winId]);
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'one-click': return 'bg-green-100 text-green-700 border-green-200';
      case 'minimal': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredWins = quickWins.filter(win => {
    const categoryMatch = selectedCategory === 'all' || win.category === selectedCategory;
    const statusMatch = showApplied || !appliedWins.includes(win.id);
    return categoryMatch && statusMatch;
  });

  const availableWins = quickWins.filter(win => !appliedWins.includes(win.id));
  const appliedWinsList = quickWins.filter(win => appliedWins.includes(win.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quick Wins
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            One-click optimizations that can boost your performance immediately
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
              <Sparkles className="w-4 h-4" />
              {availableWins.length} available wins
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">Potential gains up to +200%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              <option value="optimization">Optimization</option>
              <option value="automation">Automation</option>
              <option value="engagement">Engagement</option>
              <option value="content">Content</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showApplied"
              checked={showApplied}
              onChange={(e) => setShowApplied(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="showApplied" className="text-sm font-medium text-gray-700">
              Show applied wins ({appliedWinsList.length})
            </label>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{availableWins.length}</h3>
            <p className="text-sm text-gray-600">Available Wins</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{quickWins.filter(w => w.effort === 'one-click').length}</h3>
            <p className="text-sm text-gray-600">One-Click Wins</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{quickWins.filter(w => w.impact === 'high').length}</h3>
            <p className="text-sm text-gray-600">High Impact</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{appliedWinsList.length}</h3>
            <p className="text-sm text-gray-600">Applied</p>
          </div>
        </div>

        {/* Quick Wins Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredWins.map((win) => {
            const IconComponent = categoryIcons[win.category];
            const isApplied = appliedWins.includes(win.id);

            return (
              <div key={win.id} className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${isApplied ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[win.category]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {win.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[win.category]}`}>
                        {win.category}
                      </span>
                    </div>
                  </div>
                  {isApplied && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Applied</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  {win.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {win.estimatedTime}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEffortColor(win.effort)}`}>
                      {win.effort}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(win.impact)}`}>
                      {win.impact} impact
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Potential gain: </span>
                    <span className="font-semibold text-green-600">{win.potentialGain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{win.aiConfidence}% confidence</span>
                    {!isApplied ? (
                      <button
                        onClick={() => handleApplyWin(win.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          win.effort === 'one-click'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {win.effort === 'one-click' ? (
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Apply Now
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Settings className="w-4 h-4" />
                            Configure
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">✓ Active</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWins.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All wins in this category applied!
            </h3>
            <p className="text-gray-600 mb-4">
              Check back later for new optimization opportunities.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setShowApplied(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Categories
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <Link href="/workspace/quickstart/today" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back: Today's Focus
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <Link href="/workspace/quickstart/snapshot" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Next: Performance Snapshot
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}