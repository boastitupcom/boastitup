'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, MessageSquare, RefreshCw, Star, Heart, ThumbsDown } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface MentionData {
  week: string;
  total_mentions: number;
  positive_mentions: number;
  negative_mentions: number;
  neutral_mentions: number;
  platforms: { [key: string]: number };
}

interface TopicBubble {
  id: string;
  volume: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  platforms: string[];
  growth: number;
}

// --- MOCK DATA GENERATION ---
const generateWeeklyMentionsData = (): MentionData[] => {
  const weeks = ['Aug 5-11', 'Aug 12-18', 'Aug 19-25', 'Sep 2-8', 'Sep 9-15', 'Sep 16-22', 'Sep 23-29', 'Sep 30-Oct 6'];
  return weeks.map(week => ({
    week,
    total_mentions: Math.floor(Math.random() * 250) + 120,
    positive_mentions: Math.floor(Math.random() * 100) + 50,
    negative_mentions: Math.floor(Math.random() * 50) + 15,
    neutral_mentions: Math.floor(Math.random() * 70) + 40,
    platforms: {
      reddit: Math.floor(Math.random() * 60) + 20,
      trustpilot: Math.floor(Math.random() * 40) + 10,
      instagram: Math.floor(Math.random() * 50) + 25,
      tiktok: Math.floor(Math.random() * 45) + 15,
      facebook: Math.floor(Math.random() * 35) + 10,
      youtube: Math.floor(Math.random() * 30) + 5,
    }
  }));
};

const topicsData: TopicBubble[] = [
  { id: 'Product Quality', volume: 320, sentiment: 'Positive', platforms: ['reddit', 'trustpilot'], growth: 15 },
  { id: 'Customer Support', volume: 180, sentiment: 'Negative', platforms: ['trustpilot', 'facebook'], growth: -8 },
  { id: 'Pricing', volume: 250, sentiment: 'Positive', platforms: ['reddit', 'instagram'], growth: 22 },
  { id: 'Delivery Speed', volume: 95, sentiment: 'Negative', platforms: ['trustpilot'], growth: -12 },
  { id: 'User Experience', volume: 410, sentiment: 'Positive', platforms: ['instagram', 'tiktok', 'youtube'], growth: 35 },
  { id: 'Features', volume: 160, sentiment: 'Neutral', platforms: ['reddit', 'youtube'], growth: 5 },
];

const brandScoreData = [ {day: 1, score: 92}, {day: 2, score: 93}, {day: 3, score: 92.5}, {day: 4, score: 94}, {day: 5, score: 94.2} ];

// --- PLATFORM CONFIG ---
const platformConfig = {
  reddit: { icon: '🔴', name: 'Reddit' },
  trustpilot: { icon: '⭐', name: 'Trustpilot' },
  instagram: { icon: '📷', name: 'Instagram' },
  tiktok: { icon: '🎵', name: 'TikTok' },
  facebook: { icon: '👥', name: 'Facebook' },
  youtube: { icon: '▶️', name: 'YouTube' }
};

// --- HELPER COMPONENTS ---
const StatCard = ({ title, value, change, icon: Icon, changeColor, valueColor, footer }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-2">
      <p className="text-slate-600 text-sm font-medium">{title}</p>
      <Icon className="w-6 h-6 text-slate-500" />
    </div>
    <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    <div className="flex items-center gap-1 mt-1">
      {change != null && (
        <>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className={`text-sm font-semibold ${changeColor}`}>
            {change >= 0 ? '+' : ''}{change}% this week
          </span>
        </>
      )}
    </div>
    {footer && <p className="text-xs text-slate-500 mt-2">{footer}</p>}
  </div>
);

const BubbleChart = ({ data }) => {
  const colorScale = { Positive: '#10b981', Negative: '#ef4444', Neutral: '#6b7280' };
  const maxVolume = Math.max(...data.map(d => d.volume));

  // A simple packing simulation to avoid overlaps
  const bubbles = data.map(d => ({
    ...d,
    radius: 18 + (d.volume / maxVolume) * 40,
    x: Math.random() * 400,
    y: Math.random() * 250
  }));

  // Simple collision detection for better layout
  for (let i = 0; i < 5; i++) {
    bubbles.forEach(b1 => {
      bubbles.forEach(b2 => {
        if (b1.id !== b2.id) {
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = b1.radius + b2.radius;
          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const overlap = minDistance - distance;
            b1.x -= Math.cos(angle) * overlap * 0.5;
            b1.y -= Math.sin(angle) * overlap * 0.5;
            b2.x += Math.cos(angle) * overlap * 0.5;
            b2.y += Math.sin(angle) * overlap * 0.5;
          }
        }
      });
    });
  }

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        {bubbles.map(bubble => (
          <g key={bubble.id} transform={`translate(${bubble.x}, ${bubble.y})`} className="cursor-pointer group">
            <circle r={bubble.radius} fill={colorScale[bubble.sentiment]} fillOpacity={0.7} stroke={colorScale[bubble.sentiment]} strokeWidth={2} />
            <text textAnchor="middle" dy=".3em" fill="white" className="text-xs font-bold pointer-events-none select-none">
              {bubble.id.length > 10 ? bubble.id.substring(0, 8) + '...' : bubble.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const BrandScoreHero = ({ score, change, data }) => {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg mb-8 flex items-center justify-between flex-wrap">
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle stroke="#e5e7eb" strokeWidth="8" fill="transparent" r={radius} cx="60" cy="60" />
            <circle
              stroke="#059669" // emerald-600
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
              transform="rotate(-90 60 60)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">{score}%</span>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+{change}%</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Excellent Brand Score</h2>
          <p className="text-slate-600">Based on overall positive sentiment and volume.</p>
        </div>
      </div>
      <div className="w-64 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              labelFormatter={() => ''}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-center text-xs text-slate-500 font-medium">5-day outlook</p>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const BrandMentionsDashboardSME = () => {
  const [weeklyData, setWeeklyData] = useState<MentionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWeeklyData(generateWeeklyMentionsData());
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading Brand Mentions...</p>
        </div>
      </div>
    );
  }

  // --- DATA CALCULATIONS ---
  const totalMentions = weeklyData.reduce((sum, d) => sum + d.total_mentions, 0);
  const weeklyGrowth = Math.round(
    ((weeklyData[7].total_mentions - weeklyData[6].total_mentions) / weeklyData[6].total_mentions) * 100
  );

  const sentimentSummary = weeklyData.reduce((acc, d) => ({
    positive: acc.positive + d.positive_mentions,
    negative: acc.negative + d.negative_mentions,
  }), { positive: 0, negative: 0 });

  const positivePercentage = Math.round((sentimentSummary.positive / totalMentions) * 100);
  const negativePercentage = Math.round((sentimentSummary.negative / totalMentions) * 100);

  const platformTotals = Object.keys(platformConfig).reduce((acc, platform) => {
    acc[platform] = weeklyData.reduce((sum, d) => sum + (d.platforms[platform] || 0), 0);
    return acc;
  }, {});

  const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0];
  const topPlatformPercentage = Math.round((topPlatform[1] / totalMentions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Brand Mentions Dashboard</h1>
            <p className="text-slate-600">Weekly aggregated mentions for the last 8 weeks.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </header>

        {/* Hero Row: Brand Score */}
        <BrandScoreHero score={94.2} change={2.1} data={brandScoreData} />

        {/* Main 4x4 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Row 1: Key Metrics */}
          <StatCard
            title="Total Mentions"
            value={totalMentions.toLocaleString()}
            change={weeklyGrowth}
            icon={MessageSquare}
            valueColor="text-slate-800"
            changeColor={weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}
          />
          <StatCard
            title="Positive Sentiment"
            value={`${positivePercentage}%`}
            icon={Heart}
            valueColor="text-green-600"
            footer={`${sentimentSummary.positive.toLocaleString()} mentions`}
          />
          <StatCard
            title="Negative Sentiment"
            value={`${negativePercentage}%`}
            icon={ThumbsDown}
            valueColor="text-red-600"
            footer={`${sentimentSummary.negative.toLocaleString()} mentions`}
          />
          <StatCard
            title="Top Platform"
            value={platformConfig[topPlatform[0]].name}
            icon={Star}
            valueColor="text-slate-800"
            footer={`${topPlatformPercentage}% of mentions`}
          />

          {/* Row 2: Main Visualizations */}
          <div className="lg:col-span-2 md:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Mentions Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="total_mentions" stroke="#3b82f6" strokeWidth={2} fill="url(#totalGradient)" />
                  <Area type="monotone" dataKey="positive_mentions" stroke="#10b981" strokeWidth={1.5} fill="transparent" />
                  <Area type="monotone" dataKey="negative_mentions" stroke="#ef4444" strokeWidth={1.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 md:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Topics by Sentiment & Volume</h3>
            <p className="text-xs text-slate-500 mb-2">Bubble size indicates mention volume</p>
            <div className="flex-grow h-64">
              <BubbleChart data={topicsData} />
            </div>
          </div>

          {/* Row 3: Platform Distribution */}
          <div className="lg:col-span-4 md:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Platform Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(platformTotals).map(([platform, total]) => {
                const percentage = Math.round((total / totalMentions) * 100);
                return (
                  <div key={platform} className="text-center p-4 bg-slate-50/70 rounded-lg hover:bg-slate-100/80 transition-colors border border-slate-200/50">
                    <div className="text-3xl mb-2">{platformConfig[platform].icon}</div>
                    <div className="font-semibold text-slate-800 capitalize text-sm">{platformConfig[platform].name}</div>
                    <div className="text-xl font-bold text-blue-600">{percentage}%</div>
                    <div className="text-xs text-slate-500">{total.toLocaleString()} mentions</div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default BrandMentionsDashboardSME;