/**
 * Comprehensive Error Logging System for OKR Template Loading
 * 
 * Provides structured error logging, categorization, and context collection
 * for debugging template loading issues.
 */

interface ErrorContext {
  userId?: string;
  brandId?: string;
  tenantId?: string;
  industrySlug?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  sessionId?: string;
  buildVersion?: string;
}

interface ErrorLog {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  error?: Error;
  context: ErrorContext;
  stackTrace?: string;
  additionalData?: Record<string, any>;
  timestamp: string;
}

type ErrorCategory = 
  | 'template_loading'
  | 'database_query'
  | 'network_error'
  | 'validation_error'
  | 'permission_error'
  | 'component_error'
  | 'unknown';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Initialize session storage for development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.loadFromSessionStorage();
    }
  }

  /**
   * Log an error with full context
   */
  logError(
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    error?: Error,
    additionalData?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId();
    const context = this.collectContext(additionalData);
    
    const errorLog: ErrorLog = {
      id: errorId,
      category,
      severity,
      message,
      error,
      context,
      stackTrace: error?.stack,
      additionalData,
      timestamp: new Date().toISOString()
    };

    this.logs.push(errorLog);
    
    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging based on severity
    this.logToConsole(errorLog);
    
    // Save to session storage in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.saveToSessionStorage();
    }

    // In production, you would send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorLog);
    }

    return errorId;
  }

  /**
   * Log template loading specific errors
   */
  logTemplateError(
    message: string,
    error?: Error,
    context?: {
      industrySlug?: string;
      queryMethod?: string;
      retryCount?: number;
      fallbackAttempted?: boolean;
    }
  ): string {
    const severity = this.determineSeverity(error, context);
    
    return this.logError('template_loading', severity, message, error, {
      ...context,
      operation: 'template_fetch',
      component: 'useOKRTemplates'
    });
  }

  /**
   * Log database query errors
   */
  logDatabaseError(
    query: string,
    error: Error,
    context?: {
      table?: string;
      filters?: Record<string, any>;
      retryCount?: number;
    }
  ): string {
    return this.logError('database_query', 'high', `Database query failed: ${query}`, error, {
      ...context,
      query,
      errorCode: (error as any)?.code,
      errorDetails: (error as any)?.details
    });
  }

  /**
   * Log component rendering errors
   */
  logComponentError(
    componentName: string,
    error: Error,
    props?: Record<string, any>
  ): string {
    return this.logError('component_error', 'medium', `Component error in ${componentName}`, error, {
      componentName,
      props: this.sanitizeProps(props),
      reactVersion: React?.version
    });
  }

  /**
   * Log network/API errors
   */
  logNetworkError(
    url: string,
    method: string,
    error: Error,
    response?: Response
  ): string {
    return this.logError('network_error', 'high', `Network request failed: ${method} ${url}`, error, {
      url,
      method,
      status: response?.status,
      statusText: response?.statusText,
      headers: response?.headers ? Object.fromEntries(response.headers.entries()) : undefined
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorLog[];
    topErrors: Array<{ message: string; count: number; category: ErrorCategory }>;
  } {
    const errorsByCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = this.logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    // Group by message to find most common errors
    const errorCounts = this.logs.reduce((acc, log) => {
      const key = log.message;
      if (!acc[key]) {
        acc[key] = { message: log.message, count: 0, category: log.category };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { message: string; count: number; category: ErrorCategory }>);

    const topErrors = Object.values(errorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors: this.logs.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.logs.slice(-10),
      topErrors
    };
  }

  /**
   * Export error logs for analysis
   */
  exportLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all error logs
   */
  clearLogs(): void {
    this.logs = [];
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('okr-error-logs');
    }
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const stats = this.getErrorStats();
    
    let report = `OKR Error Report - ${new Date().toISOString()}\n`;
    report += `Session ID: ${this.sessionId}\n`;
    report += `Total Errors: ${stats.totalErrors}\n\n`;
    
    report += `Errors by Category:\n`;
    Object.entries(stats.errorsByCategory).forEach(([category, count]) => {
      report += `  ${category}: ${count}\n`;
    });
    
    report += `\nErrors by Severity:\n`;
    Object.entries(stats.errorsBySeverity).forEach(([severity, count]) => {
      report += `  ${severity}: ${count}\n`;
    });
    
    report += `\nTop Errors:\n`;
    stats.topErrors.forEach((error, index) => {
      report += `  ${index + 1}. ${error.message} (${error.count} times, ${error.category})\n`;
    });
    
    report += `\nRecent Errors:\n`;
    stats.recentErrors.forEach((error, index) => {
      report += `  ${index + 1}. [${error.severity}] ${error.message} (${error.timestamp})\n`;
    });
    
    return report;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private collectContext(additionalData?: Record<string, any>): ErrorContext {
    const context: ErrorContext = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'development'
    };

    if (typeof window !== 'undefined') {
      context.userAgent = window.navigator.userAgent;
      context.url = window.location.href;
    }

    // Add any additional context from the caller
    if (additionalData) {
      Object.assign(context, additionalData);
    }

    return context;
  }

  private determineSeverity(error?: Error, context?: Record<string, any>): ErrorSeverity {
    // Network errors are usually high severity
    if (error?.message.includes('fetch') || error?.message.includes('network')) {
      return 'high';
    }

    // Database errors are high severity
    if (error?.message.includes('database') || error?.message.includes('supabase')) {
      return 'high';
    }

    // Multiple retries indicate a persistent issue
    if (context?.retryCount && context.retryCount > 2) {
      return 'high';
    }

    // Fallback usage indicates degraded functionality
    if (context?.fallbackAttempted) {
      return 'medium';
    }

    return 'medium';
  }

  private sanitizeProps(props?: Record<string, any>): Record<string, any> | undefined {
    if (!props) return undefined;

    // Remove sensitive data and functions
    const sanitized: Record<string, any> = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = '[Object]';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private logToConsole(errorLog: ErrorLog): void {
    const prefix = `[ErrorLogger] ${errorLog.severity.toUpperCase()}`;
    const message = `${prefix} [${errorLog.category}] ${errorLog.message}`;
    
    switch (errorLog.severity) {
      case 'critical':
      case 'high':
        console.error(message, errorLog.error, errorLog.additionalData);
        break;
      case 'medium':
        console.warn(message, errorLog.error, errorLog.additionalData);
        break;
      case 'low':
        console.log(message, errorLog.additionalData);
        break;
    }
  }

  private saveToSessionStorage(): void {
    try {
      sessionStorage.setItem('okr-error-logs', JSON.stringify(this.logs.slice(-50))); // Keep last 50
    } catch (error) {
      console.warn('Failed to save error logs to session storage:', error);
    }
  }

  private loadFromSessionStorage(): void {
    try {
      const stored = sessionStorage.getItem('okr-error-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load error logs from session storage:', error);
    }
  }

  private sendToErrorService(errorLog: ErrorLog): void {
    // In production, send to error reporting service like Sentry, LogRocket, etc.
    // This is a placeholder for the actual implementation
    console.log('Would send to error service:', errorLog);
  }
}

// Global instance
export const errorLogger = new ErrorLogger();

// React hook for error logging
export function useErrorLogger() {
  const logError = (category: ErrorCategory, severity: ErrorSeverity, message: string, error?: Error, additionalData?: Record<string, any>) => {
    return errorLogger.logError(category, severity, message, error, additionalData);
  };

  const logTemplateError = (message: string, error?: Error, context?: any) => {
    return errorLogger.logTemplateError(message, error, context);
  };

  const logDatabaseError = (query: string, error: Error, context?: any) => {
    return errorLogger.logDatabaseError(query, error, context);
  };

  const logComponentError = (componentName: string, error: Error, props?: Record<string, any>) => {
    return errorLogger.logComponentError(componentName, error, props);
  };

  const getErrorStats = () => errorLogger.getErrorStats();
  const generateReport = () => errorLogger.generateReport();

  return {
    logError,
    logTemplateError,
    logDatabaseError,
    logComponentError,
    getErrorStats,
    generateReport
  };
}

// Development helper to access error logger from browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).okrErrorLogger = errorLogger;
}