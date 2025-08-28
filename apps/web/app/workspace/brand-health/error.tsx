'use client';

import { useEffect } from 'react';
import { Button, Card, CardContent } from '@boastitup/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BrandHealthError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Brand Health Dashboard Error:', error);
  }, [error]);

  const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
  const isAuthError = error.message?.includes('auth') || error.message?.includes('unauthorized');
  const isPermissionError = error.message?.includes('permission') || error.message?.includes('access');

  const getErrorMessage = () => {
    if (isAuthError) {
      return {
        title: 'Authentication Required',
        description: 'You need to sign in to access the brand health dashboard.',
        action: 'Sign In',
        href: '/auth/login'
      };
    }
    
    if (isPermissionError) {
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to view this brand\'s health data. Contact your administrator to request access.',
        action: 'Go to Workspace',
        href: '/workspace'
      };
    }
    
    if (isNetworkError) {
      return {
        title: 'Connection Problem',
        description: 'Unable to connect to our servers. Please check your internet connection and try again.',
        action: 'Retry',
        onClick: reset
      };
    }
    
    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred while loading your brand health dashboard. Our team has been notified.',
      action: 'Try Again',
      onClick: reset
    };
  };

  const { title, description, action, href, onClick } = getErrorMessage();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {onClick ? (
              <Button onClick={onClick} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>{action}</span>
              </Button>
            ) : href ? (
              <Button asChild className="flex items-center space-x-2">
                <Link href={href}>
                  <Home className="h-4 w-4" />
                  <span>{action}</span>
                </Link>
              </Button>
            ) : null}
            
            <Button variant="outline" asChild>
              <Link href="/workspace">
                <Home className="h-4 w-4 mr-2" />
                Return to Workspace
              </Link>
            </Button>
          </div>
          
          {error.digest && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Error ID:</p>
              <code className="text-xs text-gray-700 font-mono">
                {error.digest}
              </code>
            </div>
          )}
          
          <details className="mt-6 text-left max-w-full">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-w-full">
              {error.stack || error.message}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}