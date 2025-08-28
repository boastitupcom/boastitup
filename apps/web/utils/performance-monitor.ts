/**
 * Performance Monitoring Utilities for OKR Template Loading
 * 
 * Provides comprehensive performance tracking, metrics collection,
 * and alerting for template loading operations.
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  success?: boolean;
  error?: string;
}

interface PerformanceAlert {
  type: 'slow_loading' | 'high_error_rate' | 'fallback_usage';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private alerts: PerformanceAlert[] = [];
  private thresholds = {
    templateLoadingTime: 2000, // 2 seconds
    errorRateThreshold: 0.1, // 10%
    fallbackUsageThreshold: 0.2 // 20%
  };

  /**
   * Start tracking a performance metric
   */
  startMetric(operationId: string, operation: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    this.metrics.set(operationId, metric);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PerformanceMonitor] 🚀 Started: ${operation}`, metadata);
    }
  }

  /**
   * End tracking and calculate duration
   */
  endMetric(operationId: string, success: boolean = true, error?: string): PerformanceMetric | null {
    const metric = this.metrics.get(operationId);
    if (!metric) {
      console.warn(`[PerformanceMonitor] ⚠️ No metric found for operation: ${operationId}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    if (process.env.NODE_ENV === 'development') {
      const status = success ? '✅' : '❌';
      console.log(`[PerformanceMonitor] ${status} Completed: ${metric.operation} in ${metric.duration.toFixed(2)}ms`);
      
      if (error) {
        console.error(`[PerformanceMonitor] Error: ${error}`);
      }
    }

    return metric;
  }

  /**
   * Track template loading specifically
   */
  trackTemplateLoading(industrySlug: string | null, templateCount: number, queryMethod: string, fallbackUsed: boolean = false): string {
    const operationId = `template-load-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startMetric(operationId, 'template_loading', {
      industrySlug,
      templateCount,
      queryMethod,
      fallbackUsed,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    });

    return operationId;
  }

  /**
   * Complete template loading tracking
   */
  completeTemplateLoading(operationId: string, success: boolean, error?: string, additionalMetrics?: Record<string, any>): void {
    const metric = this.endMetric(operationId, success, error);
    
    if (metric && additionalMetrics) {
      metric.metadata = { ...metric.metadata, ...additionalMetrics };
    }

    // Store in session storage for debugging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const existingMetrics = JSON.parse(sessionStorage.getItem('okr-performance-metrics') || '[]');
      existingMetrics.push(metric);
      
      // Keep only last 50 metrics
      if (existingMetrics.length > 50) {
        existingMetrics.splice(0, existingMetrics.length - 50);
      }
      
      sessionStorage.setItem('okr-performance-metrics', JSON.stringify(existingMetrics));
    }
  }

  /**
   * Check for performance issues and generate alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    // Slow loading alert
    if (metric.duration > this.thresholds.templateLoadingTime) {
      this.addAlert({
        type: 'slow_loading',
        message: `Template loading took ${metric.duration.toFixed(2)}ms, exceeding ${this.thresholds.templateLoadingTime}ms threshold`,
        threshold: this.thresholds.templateLoadingTime,
        actualValue: metric.duration,
        timestamp: new Date().toISOString()
      });
    }

    // Fallback usage alert
    if (metric.metadata?.fallbackUsed) {
      this.addAlert({
        type: 'fallback_usage',
        message: `Fallback query method used: ${metric.metadata.queryMethod}`,
        threshold: this.thresholds.fallbackUsageThreshold,
        actualValue: 1,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Add a performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Keep only last 20 alerts
    if (this.alerts.length > 20) {
      this.alerts.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[PerformanceMonitor] 🚨 Alert: ${alert.message}`);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalOperations: number;
    averageLoadTime: number;
    successRate: number;
    fallbackUsageRate: number;
    recentAlerts: PerformanceAlert[];
  } {
    const completedMetrics = Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
    
    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageLoadTime: 0,
        successRate: 0,
        fallbackUsageRate: 0,
        recentAlerts: this.alerts
      };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const successfulOperations = completedMetrics.filter(m => m.success).length;
    const fallbackOperations = completedMetrics.filter(m => m.metadata?.fallbackUsed).length;

    return {
      totalOperations: completedMetrics.length,
      averageLoadTime: totalDuration / completedMetrics.length,
      successRate: successfulOperations / completedMetrics.length,
      fallbackUsageRate: fallbackOperations / completedMetrics.length,
      recentAlerts: this.alerts.slice(-5) // Last 5 alerts
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Clear all metrics and alerts
   */
  clear(): void {
    this.metrics.clear();
    this.alerts = [];
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('okr-performance-metrics');
    }
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const stats = this.getStats();
    
    console.group('[PerformanceMonitor] 📊 Performance Summary');
    console.log(`Total Operations: ${stats.totalOperations}`);
    console.log(`Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
    console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Fallback Usage Rate: ${(stats.fallbackUsageRate * 100).toFixed(1)}%`);
    
    if (stats.recentAlerts.length > 0) {
      console.log('\nRecent Alerts:');
      stats.recentAlerts.forEach(alert => {
        console.warn(`  🚨 ${alert.type}: ${alert.message}`);
      });
    }
    
    console.groupEnd();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const trackOperation = (operation: string, metadata?: Record<string, any>) => {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    performanceMonitor.startMetric(operationId, operation, metadata);
    return operationId;
  };

  const completeOperation = (operationId: string, success: boolean = true, error?: string) => {
    performanceMonitor.endMetric(operationId, success, error);
  };

  const trackTemplateLoading = (industrySlug: string | null, templateCount: number, queryMethod: string, fallbackUsed: boolean = false) => {
    return performanceMonitor.trackTemplateLoading(industrySlug, templateCount, queryMethod, fallbackUsed);
  };

  const completeTemplateLoading = (operationId: string, success: boolean, error?: string, additionalMetrics?: Record<string, any>) => {
    performanceMonitor.completeTemplateLoading(operationId, success, error, additionalMetrics);
  };

  const getStats = () => performanceMonitor.getStats();
  const logSummary = () => performanceMonitor.logSummary();

  return {
    trackOperation,
    completeOperation,
    trackTemplateLoading,
    completeTemplateLoading,
    getStats,
    logSummary
  };
}

// Development helper to access metrics from browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).okrPerformanceMonitor = performanceMonitor;
}