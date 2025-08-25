/**
 * Unit Tests for useOKRTemplates Hook
 * 
 * Tests the template loading logic, fallback strategies, error handling,
 * and performance monitoring integration.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useOKRTemplates } from '../../hooks/use-okr-templates';
import { createClient } from '@boastitup/supabase/client';
import { performanceMonitor } from '../../utils/performance-monitor';
import { errorLogger } from '../../utils/error-logger';

// Mock Supabase client
jest.mock('@boastitup/supabase/client');
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

// Mock performance monitor
jest.mock('../../utils/performance-monitor');
const mockPerformanceMonitor = performanceMonitor as jest.Mocked<typeof performanceMonitor>;

// Mock error logger
jest.mock('../../utils/error-logger');
const mockErrorLogger = errorLogger as jest.Mocked<typeof errorLogger>;

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => 1000)
  }
});

describe('useOKRTemplates', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis()
    };
    
    mockSupabase.mockReturnValue(mockSupabaseClient);
    
    // Setup performance monitor mocks
    mockPerformanceMonitor.trackTemplateLoading.mockReturnValue('test-performance-id');
    mockPerformanceMonitor.completeTemplateLoading.mockImplementation(() => {});
    
    // Setup error logger mocks
    mockErrorLogger.logDatabaseError.mockReturnValue('test-error-id');
    mockErrorLogger.logTemplateError.mockReturnValue('test-error-id');
  });

  describe('Successful template loading', () => {
    it('should load templates successfully with exact industry match', async () => {
      // Mock successful response
      const mockTemplates = [
        {
          id: '1',
          industry: 'fitness',
          category: 'Growth',
          objective_title: 'Grow Instagram Following',
          objective_description: 'Increase followers',
          suggested_timeframe: 'quarterly',
          priority_level: 1,
          is_active: true,
          tags: []
        }
      ];

      const mockMetrics = [
        {
          okr_master_id: '1',
          metric_type_id: 'metric-1',
          is_primary: true,
          target_improvement_percentage: 50,
          weight: 1.0,
          dim_metric_type: {
            id: 'metric-1',
            code: 'followers',
            description: 'Follower Count',
            unit: 'count',
            category: 'growth'
          }
        }
      ];

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'okr_master') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: mockTemplates, error: null })
          };
        } else if (table === 'okr_master_metrics') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: mockMetrics, error: null })
          };
        }
        return mockSupabaseClient;
      });

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates![0].title).toBe('Grow Instagram Following');
      expect(result.current.templates![0].category).toBe('Growth');
      expect(result.current.templates![0].metricTypeId).toBe('metric-1');
      expect(result.current.templates![0].suggestedTargetValue).toBe(50);
      expect(result.current.error).toBeNull();
    });

    it('should track performance metrics during successful loading', async () => {
      const mockTemplates = [{ id: '1', industry: 'fitness', category: 'Growth', objective_title: 'Test', priority_level: 1, is_active: true }];
      
      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: mockTemplates, error: null })
      }));

      renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(mockPerformanceMonitor.trackTemplateLoading).toHaveBeenCalledWith(
          'fitness',
          0,
          'exact_match',
          false
        );
      });

      await waitFor(() => {
        expect(mockPerformanceMonitor.completeTemplateLoading).toHaveBeenCalledWith(
          'test-performance-id',
          true,
          undefined,
          expect.objectContaining({
            templateCount: 1,
            queryMethod: 'exact_match',
            fallbackUsed: false
          })
        );
      });
    });
  });

  describe('Fallback strategies', () => {
    it('should use partial match fallback when exact match returns no results', async () => {
      const mockPartialTemplates = [
        {
          id: '2',
          industry: 'fitness-related',
          category: 'Growth',
          objective_title: 'Fitness Growth',
          priority_level: 1,
          is_active: true
        }
      ];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'okr_master') {
          callCount++;
          if (callCount === 1) {
            // First call (exact match) returns empty
            return {
              ...mockSupabaseClient,
              then: (callback: any) => callback({ data: [], error: null })
            };
          } else if (callCount === 2) {
            // Second call (partial match) returns results
            return {
              ...mockSupabaseClient,
              then: (callback: any) => callback({ data: mockPartialTemplates, error: null })
            };
          }
        } else if (table === 'okr_master_metrics') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: [], error: null })
          };
        }
        return mockSupabaseClient;
      });

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates![0].title).toBe('Fitness Growth');
      
      // Should have called performance monitor with fallback info
      await waitFor(() => {
        expect(mockPerformanceMonitor.completeTemplateLoading).toHaveBeenCalledWith(
          'test-performance-id',
          true,
          undefined,
          expect.objectContaining({
            queryMethod: 'contains_match',
            fallbackUsed: true
          })
        );
      });
    });

    it('should use all templates fallback when partial match fails', async () => {
      const mockAllTemplates = [
        {
          id: '3',
          industry: 'general',
          category: 'Growth',
          objective_title: 'General Growth',
          priority_level: 1,
          is_active: true
        }
      ];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'okr_master') {
          callCount++;
          if (callCount <= 2) {
            // First two calls return empty
            return {
              ...mockSupabaseClient,
              then: (callback: any) => callback({ data: [], error: null })
            };
          } else {
            // Third call (all templates) returns results
            return {
              ...mockSupabaseClient,
              then: (callback: any) => callback({ data: mockAllTemplates, error: null })
            };
          }
        } else if (table === 'okr_master_metrics') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: [], error: null })
          };
        }
        return mockSupabaseClient;
      });

      const { result } = renderHook(() => useOKRTemplates('nonexistent'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates![0].title).toBe('General Growth');
      
      // Should have used all_templates method
      await waitFor(() => {
        expect(mockPerformanceMonitor.completeTemplateLoading).toHaveBeenCalledWith(
          'test-performance-id',
          true,
          undefined,
          expect.objectContaining({
            queryMethod: 'all_templates',
            fallbackUsed: true
          })
        );
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed', code: 'PGRST301' };
      
      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: null, error: mockError })
      }));

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error!.message).toBe('Database connection failed');
      expect(result.current.templates).toBeNull();

      // Should log database error
      expect(mockErrorLogger.logDatabaseError).toHaveBeenCalledWith(
        'SELECT * FROM okr_master WHERE industry = ? AND is_active = true',
        expect.any(Error),
        expect.objectContaining({
          table: 'okr_master',
          queryMethod: 'exact_match'
        })
      );

      // Should complete performance tracking with error
      expect(mockPerformanceMonitor.completeTemplateLoading).toHaveBeenCalledWith(
        'test-performance-id',
        false,
        'Database connection failed',
        expect.any(Object)
      );
    });

    it('should handle metrics loading errors without failing template loading', async () => {
      const mockTemplates = [
        {
          id: '1',
          industry: 'fitness',
          category: 'Growth',
          objective_title: 'Test Template',
          priority_level: 1,
          is_active: true
        }
      ];

      const mockMetricsError = { message: 'Metrics table unavailable' };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'okr_master') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: mockTemplates, error: null })
          };
        } else if (table === 'okr_master_metrics') {
          return {
            ...mockSupabaseClient,
            then: (callback: any) => callback({ data: null, error: mockMetricsError })
          };
        }
        return mockSupabaseClient;
      });

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still load templates despite metrics error
      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates![0].title).toBe('Test Template');
      expect(result.current.error).toBeNull();

      // Should log metrics error
      expect(mockErrorLogger.logDatabaseError).toHaveBeenCalledWith(
        'SELECT * FROM okr_master_metrics WHERE okr_master_id IN (?)',
        expect.any(Error),
        expect.objectContaining({
          table: 'okr_master_metrics',
          queryMethod: 'metrics_fetch'
        })
      );
    });

    it('should handle network errors and retry mechanism', async () => {
      const networkError = new Error('Network request failed');
      
      mockSupabaseClient.from.mockImplementation(() => {
        throw networkError;
      });

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.retryWithBackoff).toBeDefined();

      // Should log template error
      expect(mockErrorLogger.logTemplateError).toHaveBeenCalledWith(
        expect.stringContaining('Template loading failed'),
        networkError,
        expect.objectContaining({
          industrySlug: 'fitness',
          retryCount: 1
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle null industry slug', async () => {
      const mockTemplates = [
        {
          id: '1',
          industry: 'general',
          category: 'Growth',
          objective_title: 'General Template',
          priority_level: 1,
          is_active: true
        }
      ];

      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: mockTemplates, error: null })
      }));

      const { result } = renderHook(() => useOKRTemplates(null));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toHaveLength(1);
      
      // Should track with null industry slug
      expect(mockPerformanceMonitor.trackTemplateLoading).toHaveBeenCalledWith(
        null,
        0,
        'exact_match',
        false
      );
    });

    it('should handle empty string industry slug', async () => {
      const { result } = renderHook(() => useOKRTemplates(''));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should treat empty string as null
      expect(mockPerformanceMonitor.trackTemplateLoading).toHaveBeenCalledWith(
        '',
        0,
        'exact_match',
        false
      );
    });

    it('should handle malformed template data', async () => {
      const malformedTemplates = [
        {
          id: '1',
          // Missing required fields
          category: 'Growth',
          priority_level: 1,
          is_active: true
        }
      ];

      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: malformedTemplates, error: null })
      }));

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle malformed data gracefully
      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates![0].title).toBe(''); // Should default to empty string
    });
  });

  describe('Debug information', () => {
    it('should provide debug information in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockTemplates = [
        {
          id: '1',
          industry: 'fitness',
          category: 'Growth',
          objective_title: 'Test Template',
          priority_level: 1,
          is_active: true
        }
      ];

      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: mockTemplates, error: null })
      }));

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.debugInfo).toBeDefined();
      expect(result.current.debugInfo!.industrySlug).toBe('fitness');
      expect(result.current.debugInfo!.queryMethod).toBe('exact_match');
      expect(result.current.debugInfo!.results.totalFound).toBe(1);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not provide debug information in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockTemplates = [
        {
          id: '1',
          industry: 'fitness',
          category: 'Growth',
          objective_title: 'Test Template',
          priority_level: 1,
          is_active: true
        }
      ];

      mockSupabaseClient.from.mockImplementation(() => ({
        ...mockSupabaseClient,
        then: (callback: any) => callback({ data: mockTemplates, error: null })
      }));

      const { result } = renderHook(() => useOKRTemplates('fitness'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.debugInfo).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});