'use client';

import React, { useState, useEffect } from 'react';
import {
  useInstagramAnalysis,
  formatNumber,
  formatPercentage,
  getTrendColor,
  getHealthScoreColor,
  getRecommendationColor
} from '@boastitup/hooks';
import { createClient } from '@boastitup/supabase/client';

interface Brand {
  id: string;
  name: string;
  tenant_id: string;
}

// Hook to get the current user's active brand
function useActiveBrand() {
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchActiveBrand = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        // Get user's active tenant
        const { data: userTenant } = await supabase
          .from('user_tenant_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (userTenant?.tenant_id) {
          // Get user's first active brand for the tenant
          const { data: userBrand } = await supabase
            .from('user_brand_roles')
            .select(`
              brand_id,
              brands!inner(id, name, tenant_id)
            `)
            .eq('tenant_id', userTenant.tenant_id)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (userBrand?.brands) {
            const brand: Brand = {
              id: userBrand.brands.id,
              name: userBrand.brands.name,
              tenant_id: userBrand.brands.tenant_id
            };
            setActiveBrand(brand);
          } else {
            // Fallback to demo brand
            setActiveBrand({
              id: 'd96060ac-48b6-447f-9161-9d7f8619cdfa',
              name: 'One Science Nutrition | India',
              tenant_id: 'demo-tenant'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching active brand:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch brand');
        // Fallback to demo brand
        setActiveBrand({
          id: 'd96060ac-48b6-447f-9161-9d7f8619cdfa',
          name: 'One Science Nutrition | India',
          tenant_id: 'demo-tenant'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBrand();
  }, [supabase]);

  return { activeBrand, loading, error };
}

const InstagramAnalysisPage = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { activeBrand, loading: brandLoading, error: brandError } = useActiveBrand();
  const { analysis, posts, hashtags, trends, loading: dataLoading, error: dataError, refreshData } = useInstagramAnalysis(activeBrand?.id || null, dateRange);

  // Combined loading state
  const loading = brandLoading || dataLoading;
  const error = brandError || dataError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {brandLoading ? 'Loading brand information...' : 'Loading Instagram analysis...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeBrand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Brand Selected</h2>
          <p className="text-gray-500 mb-4">
            Please select a brand from the header to view Instagram analysis.
          </p>
          <p className="text-sm text-gray-400">
            {brandError && `Error: ${brandError}`}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Analysis Data</h2>
          <p className="text-gray-500 mb-4">
            No Instagram analysis data found for {activeBrand.name}.
          </p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const topPosts = posts.filter(post => post.is_top_performer).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instagram Analysis</h1>
              <p className="text-sm text-gray-500">
                {activeBrand ? (
                  <>Comprehensive insights for {activeBrand.name} • @{analysis?.instagram_handle || 'Loading...'}</>
                ) : (
                  'Loading brand information...'
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Health Score */}
              <div className={`p-6 rounded-lg border-2 ${getHealthScoreColor(analysis.health_score)}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {analysis.health_score.toFixed(1)}/10
                  </div>
                  <div className="text-sm font-medium">Health Score</div>
                  <div className="text-xs mt-1">{analysis.health_score_grade}</div>
                </div>
              </div>

              {/* Followers */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(analysis.followers_count)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                  <div className={`text-xs mt-1 ${getTrendColor(analysis.followers_growth_rate)}`}>
                    {formatPercentage(analysis.followers_growth_rate)}
                  </div>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {analysis.engagement_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                  <div className={`text-xs mt-1 ${getTrendColor(analysis.engagement_rate_change)}`}>
                    {formatPercentage(analysis.engagement_rate_change)}
                  </div>
                </div>
              </div>

              {/* Monthly Reach */}
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(analysis.monthly_reach)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Reach</div>
                  <div className={`text-xs mt-1 ${getTrendColor(analysis.monthly_reach_change)}`}>
                    {formatPercentage(analysis.monthly_reach_change)}
                  </div>
                </div>
              </div>
            </div>

            {/* Posting Pattern & Best Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Posting Pattern Heatmap */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Posting Pattern & Engagement</h3>
                <div className="space-y-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                    <div key={day} className="flex items-center space-x-2">
                      <div className="w-8 text-xs text-gray-600">{day}</div>
                      <div className="flex space-x-1">
                        {Array.from({ length: 24 }, (_, hour) => {
                          // Mock intensity based on best posting times
                          const isOptimalTime = analysis.best_posting_times.some(time =>
                            time.day.toLowerCase() === day.toLowerCase() &&
                            time.time_range.includes(hour.toString())
                          );
                          const intensity = isOptimalTime ? 'high' : Math.random() > 0.7 ? 'medium' : 'low';

                          return (
                            <div
                              key={hour}
                              className={`w-3 h-3 rounded ${
                                intensity === 'high' ? 'bg-green-500' :
                                intensity === 'medium' ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                              title={`${day} ${hour}:00 - ${hour + 1}:00`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Times to Post */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Best Times to Post</h3>
                <div className="space-y-3">
                  {analysis.best_posting_times.slice(0, 3).map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium capitalize">{time.day} {time.time_range}</div>
                        <div className="text-sm text-gray-600">
                          {time.avg_engagement.toFixed(1)}% avg engagement
                        </div>
                      </div>
                      <div className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Mix */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Content Mix</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.content_mix.reels}%
                  </div>
                  <div className="text-sm text-gray-600">Reels</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${analysis.content_mix.reels}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.content_mix.photos}%
                  </div>
                  <div className="text-sm text-gray-600">Photos</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysis.content_mix.photos}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysis.content_mix.carousels}%
                  </div>
                  <div className="text-sm text-gray-600">Carousels</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${analysis.content_mix.carousels}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.post_type === 'reel' ? 'bg-blue-100 text-blue-800' :
                        post.post_type === 'carousel' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.post_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatNumber(post.views_count || post.reach)} views
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {post.preview_text || `${post.post_type} content`}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {post.engagement_rate.toFixed(1)}% engagement
                    </div>
                    {post.viral_factors.length > 0 && (
                      <div className="text-xs">
                        <span className="text-orange-600 font-medium">
                          🔥 {post.viral_factors[0]}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Audience Insights */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Audience Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sentiment Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Sentiment Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Positive</span>
                      <span className="text-sm font-medium text-green-600">
                        {analysis.sentiment_positive}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${analysis.sentiment_positive}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Neutral</span>
                      <span className="text-sm font-medium text-gray-600">
                        {analysis.sentiment_neutral}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${analysis.sentiment_neutral}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Negative</span>
                      <span className="text-sm font-medium text-red-600">
                        {analysis.sentiment_negative}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${analysis.sentiment_negative}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <h4 className="font-medium mb-3">Demographics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Age Groups</div>
                      {Object.entries(analysis.audience_demographics.age_groups).map(([age, percentage]) => (
                        <div key={age} className="flex items-center justify-between text-sm">
                          <span>{age}</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Gender</div>
                      {Object.entries(analysis.audience_demographics.gender).map(([gender, percentage]) => (
                        <div key={gender} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{gender}</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Common Keywords */}
                <div>
                  <h4 className="font-medium mb-3">Common Keywords</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-green-600 font-medium mb-1">Positive</div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.positive_keywords.slice(0, 4).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 font-medium mb-1">Neutral</div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.neutral_keywords.slice(0, 4).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* What's Trending */}
            {trends && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">What's Trending in Fitness (2025)</h3>

                {/* Trending Audio */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium">🎵 Trending Audio</span>
                  </div>
                  <div className="space-y-1">
                    {trends.trending_audios.slice(0, 3).map((audio, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • "{audio.name}" ({formatNumber(audio.usage_count)} uses)
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hot Topics */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium">🔥 Hot Topics</span>
                  </div>
                  <div className="space-y-1">
                    {trends.hot_topics.slice(0, 4).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{topic.topic}</span>
                        <span className="text-green-600">{topic.growth}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Viral Content Formats */}
            {trends && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">🦠 Viral Content Formats</h3>
                <div className="space-y-2">
                  {trends.viral_content_formats.map((format, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">"{format.format}"</span>
                        <span className="text-green-600 text-xs">{format.growth}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {format.engagement_rate}% avg engagement
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Powered Recommendations */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">💡 AI-Powered Recommendations</h3>
              <div className="space-y-3">
                {analysis.ai_recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded border ${getRecommendationColor(rec.priority)}`}>
                    <div className="font-medium text-sm mb-1">{rec.title}</div>
                    <div className="text-xs mb-2">{rec.description}</div>
                    <div className="text-xs font-medium">Expected: {rec.expected_impact}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramAnalysisPage;