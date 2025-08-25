"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class OKRErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[OKRErrorBoundary] ❌ React Error Boundary caught error:', error);
    console.error('[OKRErrorBoundary] 📊 Error Info:', errorInfo);
    console.error('[OKRErrorBoundary] 🔍 Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    console.log('[OKRErrorBoundary] 🔄 Retrying after error boundary catch');
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Something went wrong with the OKR templates</h3>
                  <p className="text-sm">
                    We encountered an error while loading the OKR template interface. 
                    This might be a temporary issue.
                  </p>
                </div>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-red-100 rounded border">
                    <summary className="cursor-pointer font-medium text-sm">
                      Technical Details (Development Mode)
                    </summary>
                    <div className="mt-2 text-xs font-mono">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap text-xs mt-1">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={this.handleRetry}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>

                {this.state.retryCount > 0 && (
                  <p className="text-xs text-red-600">
                    Retry attempts: {this.state.retryCount}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('[useErrorHandler] ❌ Handled error:', error);
    if (errorInfo) {
      console.error('[useErrorHandler] 📊 Error context:', errorInfo);
    }
    
    // You could integrate with error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }, []);

  return { handleError };
}