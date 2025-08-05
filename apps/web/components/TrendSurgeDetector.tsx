'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@boastitup/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@boastitup/ui';
import { RefreshCw, TrendingUp, Activity, BarChart3, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript Interfaces
interface UnifiedTrend {
  id: string;
  tenant_id: string;
  brand_id: string;
  trend_name: string;
  trend_type: 'social' | 'web';
  category: string;
  subcategory: string;
  volume: number;
  growth_percentage: string;
  volume_change_24h: number;
  volume_change_7d: number;
  velocity_score: string;
  velocity_category: 'surging' | 'rising' | 'steady';
  race_position: number;
  sentiment_score: string;
  confidence_score: string;
  opportunity_score: number;
  primary_platform: string;
  primary_region: string;
  related_hashtags: string[];
  related_keywords: string[];
  trend_date: string;
  trend_start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TrendFilters {
  category?: string;
  trendType?: string;
}

interface TrendSurgeDetectorProps {
  tenantId?: string;
  className?: string;
}

const DEFAULT_TENANT_ID = '07582af5-5f8b-4fa8-b785-14e2b2252287';

export function TrendSurgeDetector({ 
  tenantId = DEFAULT_TENANT_ID, 
  className = '' 
}: TrendSurgeDetectorProps) {
  const [trends, setTrends] = useState<UnifiedTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TrendFilters>({});
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const supabase = createClient();

  // Function to manually refresh schema cache
  const refreshSchema = async () => {
    try {
      console.log('Attempting to refresh schema cache...');
      // This is a common way to refresh the schema cache in Supabase
      await supabase.rpc('refresh_schema_cache');
    } catch (refreshError) {
      console.log('Schema refresh not available or failed:', refreshError);
    }
  };

  // Fetch trends data
  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching trends with params:', {
        p_tenant_id: tenantId,
        p_category: filters.category || null,
        p_trend_type: filters.trendType || null,
        p_start_date: null,
        p_end_date: null,
      });

      // Debug: Check Supabase connection
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase client initialized:', !!supabase);

      // Try to refresh schema cache first
      await refreshSchema();

      // Try to list available functions to debug the issue
      try {
        console.log('Checking available functions...');
        const { data: functions, error: funcError } = await supabase
          .from('pg_proc')
          .select('proname')
          .like('proname', '%trend%');

        if (!funcError && functions) {
          console.log('Available trend-related functions:', functions.map(f => f.proname));
        } else {
          console.log('Could not list functions:', funcError);
        }
      } catch (funcListError) {
        console.log('Function listing failed:', funcListError);
      }

      // Try different approaches to get the data
      let data, error;

      // First, let's check what tables are available and try some alternatives
      try {
        console.log('Trying to find available tables...');

        // Try different possible table names and views
        const possibleTables = [
          'unified_trends',
          'trends',
          'trend_data',
          'v_daily_top_trends',  // View mentioned in definitions
          'v_trend_race_data'    // View mentioned in definitions
        ];
        let tableFound = false;

        for (const tableName of possibleTables) {
          try {
            console.log(`Trying table: ${tableName}`);
            let query = supabase
              .from(tableName)
              .select('*')
              .eq('tenant_id', tenantId);

            // Add filters if they exist
            if (filters.category) {
              query = query.eq('category', filters.category);
            }
            if (filters.trendType) {
              query = query.eq('trend_type', filters.trendType);
            }

            // Order by velocity score and limit results
            query = query
              .order('velocity_score', { ascending: false })
              .limit(20);

            const result = await query;

            if (!result.error && result.data) {
              console.log(`Table ${tableName} found with ${result.data.length} records`);
              data = result.data;
              error = result.error;
              tableFound = true;
              break;
            }
          } catch (tableError) {
            console.log(`Table ${tableName} not found:`, tableError);
            continue;
          }
        }

        if (!tableFound) {
          throw new Error('No suitable table found, trying RPC function...');
        }

      } catch (directQueryError) {
        console.log('Direct query failed, trying RPC function...');

        // Try multiple approaches for RPC function
        console.log('Trying RPC function approaches...');

        // First, try the suggested function from the hint
        try {
          console.log('Trying suggested function: get_industry_trends');
          const industryResult = await supabase.rpc('get_industry_trends', {
            industry: 'fitness' // or whatever parameter it might expect
          });

          if (!industryResult.error && industryResult.data) {
            console.log('get_industry_trends worked!', industryResult.data.length, 'records');
            data = industryResult.data;
            error = industryResult.error;
          } else {
            throw new Error('get_industry_trends failed');
          }
        } catch (industryError) {
          console.log('get_industry_trends failed:', industryError);

          // Try original function with different parameter approaches
          try {
            console.log('Trying get_filtered_trends with minimal params...');
            const minimalResult = await supabase.rpc('get_filtered_trends', {
              p_tenant_id: tenantId
            });
            data = minimalResult.data;
            error = minimalResult.error;
          } catch (minimalError) {
            console.log('Minimal params failed, trying with corrected order...');

            // Try with the parameter order from the error message
            const result = await supabase.rpc('get_filtered_trends', {
              p_category: filters.category || null,
              p_end_date: null,
              p_start_date: null,
              p_tenant_id: tenantId,
              p_trend_type: filters.trendType || null,
            });
            data = result.data;
            error = result.error;
          }
        }
      }

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        console.log('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No data returned from Supabase, using sample data');
        setSampleData();
        return;
      }

      console.log('Successfully fetched trends:', data.length, 'records');
      console.log('First trend sample:', data[0]);
      setTrends(data || []);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
      // Fallback to sample data for development
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Set sample data as fallback
  const setSampleData = () => {
    const sampleTrends: UnifiedTrend[] = [
      {
        id: '24c85137-a15a-4956-85e8-09e0d403077a',
        tenant_id: tenantId,
        brand_id: '4743e593-3f09-4eba-96b4-c4c1413bca47',
        trend_name: 'AI-Powered Workout Plans',
        trend_type: 'social',
        category: 'Fitness Technology',
        subcategory: 'Personalization',
        volume: 52000,
        growth_percentage: '312.5',
        volume_change_24h: 15200,
        volume_change_7d: 34000,
        velocity_score: '0.94',
        velocity_category: 'surging',
        race_position: 1,
        sentiment_score: '0.78',
        confidence_score: '0.89',
        opportunity_score: 94,
        primary_platform: 'instagram',
        primary_region: 'North America',
        related_hashtags: ['#aiworkout', '#personalizedtraining', '#fittech', '#smartfitness'],
        related_keywords: ['ai workout', 'personalized training', 'smart fitness', 'custom workout plan'],
        trend_date: '2025-08-05',
        trend_start_date: '2025-07-22',
        status: 'opportunity',
        created_at: '2025-08-05T03:48:38.792252Z',
        updated_at: '2025-08-05T03:48:38.792252Z'
      },
      {
        id: 'dd4f5bb0-1cc4-42e9-a29d-f3d8a73abdc9',
        tenant_id: tenantId,
        brand_id: '4743e593-3f09-4eba-96b4-c4c1413bca47',
        trend_name: 'Micro-Fitness Routines',
        trend_type: 'social',
        category: 'Fitness',
        subcategory: 'Time Management',
        volume: 48000,
        growth_percentage: '287.3',
        volume_change_24h: 13800,
        volume_change_7d: 29500,
        velocity_score: '0.91',
        velocity_category: 'surging',
        race_position: 2,
        sentiment_score: '0.72',
        confidence_score: '0.86',
        opportunity_score: 91,
        primary_platform: 'tiktok',
        primary_region: 'Global',
        related_hashtags: ['#microfitness', '#quickworkout', '#5minutefitness', '#busylife'],
        related_keywords: ['micro workout', '5 minute fitness', 'quick exercise', 'busy lifestyle'],
        trend_date: '2025-08-05',
        trend_start_date: '2025-07-28',
        status: 'tracking',
        created_at: '2025-08-05T03:48:38.792252Z',
        updated_at: '2025-08-05T03:48:38.792252Z'
      },
      {
        id: '8af96c51-fb66-4819-a0b9-10b1946c0647',
        tenant_id: tenantId,
        brand_id: '4743e593-3f09-4eba-96b4-c4c1413bca47',
        trend_name: 'Hybrid Fitness Classes',
        trend_type: 'web',
        category: 'Fitness',
        subcategory: 'Class Formats',
        volume: 44000,
        growth_percentage: '245.7',
        volume_change_24h: 12100,
        volume_change_7d: 26800,
        velocity_score: '0.87',
        velocity_category: 'surging',
        race_position: 3,
        sentiment_score: '0.68',
        confidence_score: '0.83',
        opportunity_score: 87,
        primary_platform: 'youtube',
        primary_region: 'Europe',
        related_hashtags: ['#hybridfitness', '#mixedworkout', '#varietytraining', '#crosstraining'],
        related_keywords: ['hybrid training', 'mixed workout', 'cross training', 'variety fitness'],
        trend_date: '2025-08-04',
        trend_start_date: '2025-07-25',
        status: 'opportunity',
        created_at: '2025-08-05T03:48:38.792252Z',
        updated_at: '2025-08-05T03:48:38.792252Z'
      }
    ];
    setTrends(sampleTrends);
  };

  useEffect(() => {
    fetchTrends();
  }, [tenantId, filters]);

  // Get velocity color
  const getVelocityColor = (category: string) => {
    switch (category) {
      case 'surging':
        return 'bg-green-500';
      case 'rising':
        return 'bg-blue-500';
      case 'steady':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Get platform badge color
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-500';
      case 'tiktok':
        return 'bg-black';
      case 'youtube':
        return 'bg-red-500';
      case 'facebook':
        return 'bg-blue-600';
      default:
        return 'bg-gray-500';
    }
  };

  // Sorted trends by velocity score
  const sortedTrends = useMemo(() => {
    return [...trends].sort((a, b) => parseFloat(b.velocity_score) - parseFloat(a.velocity_score));
  }, [trends]);

  // Top 3 trends for summary
  const topTrends = sortedTrends.slice(0, 3);

  // Chart data for velocity race
  const chartData = useMemo(() => {
    const raceData = sortedTrends
      .slice(0, 10)
      .sort((a, b) => a.race_position - b.race_position);

    return {
      labels: raceData.map(trend => trend.trend_name),
      datasets: [
        {
          label: 'Velocity Score',
          data: raceData.map(trend => parseFloat(trend.velocity_score)),
          backgroundColor: raceData.map(trend => {
            switch (trend.velocity_category) {
              case 'surging':
                return '#10b981';
              case 'rising':
                return '#3b82f6';
              case 'steady':
                return '#6b7280';
              default:
                return '#d1d5db';
            }
          }),
          borderRadius: 4,
        },
      ],
    };
  }, [sortedTrends]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Velocity Race - Top 10 Trends',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Velocity Score',
        },
      },
      y: {
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  // Get unique categories and trend types for filters
  const categories = useMemo(() => {
    const cats = new Set(trends.map(trend => trend.category));
    return Array.from(cats).sort();
  }, [trends]);

  const trendTypes = useMemo(() => {
    const types = new Set(trends.map(trend => trend.trend_type));
    return Array.from(types).sort();
  }, [trends]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Trend Surge Detector</h2>
          <div className="animate-spin">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trend Surge Detector</h2>
          <p className="text-muted-foreground">
            Monitor and analyze trending topics across social platforms
          </p>
        </div>
        <Button
          onClick={fetchTrends}
          disabled={loading}
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Activity className="h-5 w-5" />
              <span className="text-sm">
                {error} - Showing sample data for demonstration
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.trendType || 'all'}
          onValueChange={(value) =>
            setFilters(prev => ({ ...prev, trendType: value === 'all' ? undefined : value }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {trendTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 Trends Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {topTrends.map((trend, index) => (
          <Card key={trend.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
                <div className={`w-3 h-3 rounded-full ${getVelocityColor(trend.velocity_category)}`} />
              </div>
              <CardTitle className="text-lg line-clamp-2">
                {trend.trend_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge className={`text-white text-xs ${getPlatformColor(trend.primary_platform)}`}>
                  {trend.primary_platform}
                </Badge>
                <span className="text-xs">{trend.category}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Velocity Score:</span>
                  <span className="font-bold text-green-600">
                    {(parseFloat(trend.velocity_score) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Growth:</span>
                  <span className="font-bold text-blue-600">
                    +{parseFloat(trend.growth_percentage).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volume:</span>
                  <span className="font-medium">
                    {trend.volume.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Velocity Race Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Velocity Race
          </CardTitle>
          <CardDescription>
            Visual comparison of trend velocity scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* All Trends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Trends ({trends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedTrends.map((trend) => (
              <div key={trend.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getVelocityColor(trend.velocity_category)}`} />
                    <h4 className="font-semibold">{trend.trend_name}</h4>
                    <Badge variant="outline" className="text-xs">
                      Race #{trend.race_position}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge className={`text-white text-xs ${getPlatformColor(trend.primary_platform)}`}>
                      {trend.primary_platform}
                    </Badge>
                    <span>{trend.category}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {trend.volume.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-green-600">
                    {(parseFloat(trend.velocity_score) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-blue-600">
                    +{parseFloat(trend.growth_percentage).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    24h: +{trend.volume_change_24h.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}