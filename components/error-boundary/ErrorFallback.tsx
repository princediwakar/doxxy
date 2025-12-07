'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff, ShieldAlert, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorType } from '@/lib/error-utils';

interface ErrorFallbackProps {
  error?: Error | null;
  errorType: ErrorType;
  onReset?: () => void;
  onRetry?: () => void;
}

/**
 * Standard error fallback component for displaying errors to users
 * Provides appropriate messaging based on error type
 */
export function ErrorFallback({ error, errorType, onReset, onRetry }: ErrorFallbackProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return {
          icon: <WifiOff className="h-12 w-12 text-amber-500" />,
          title: 'Connection Issue',
          description: 'Unable to connect to the server. Please check your internet connection.',
          actionText: 'Retry Connection',
          showHomeButton: false,
        };
      case 'AUTH_ERROR':
        return {
          icon: <ShieldAlert className="h-12 w-12 text-red-500" />,
          title: 'Authentication Error',
          description: 'Your session may have expired. Please sign in again.',
          actionText: 'Sign In Again',
          showHomeButton: true,
        };
      case 'DATABASE_ERROR':
        return {
          icon: <Database className="h-12 w-12 text-red-500" />,
          title: 'Database Error',
          description: 'We\'re experiencing issues with our database. Our team has been notified.',
          actionText: 'Try Again',
          showHomeButton: true,
        };
      case 'VALIDATION_ERROR':
        return {
          icon: <AlertCircle className="h-12 w-12 text-blue-500" />,
          title: 'Validation Error',
          description: 'There was an issue with the data you provided. Please check and try again.',
          actionText: 'Go Back',
          showHomeButton: false,
        };
      case 'RATE_LIMIT_ERROR':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
          title: 'Too Many Requests',
          description: 'You\'ve made too many requests. Please wait a moment before trying again.',
          actionText: 'Try Again',
          showHomeButton: false,
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred. Our team has been notified.',
          actionText: 'Try Again',
          showHomeButton: true,
        };
    }
  };

  const config = getErrorConfig();

  const handleHomeClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {config.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm font-mono overflow-auto">
              <div className="font-semibold mb-1">Error Details (Development Only):</div>
              <div>{error.message}</div>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-600">Stack Trace</summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">{error.stack}</pre>
                </details>
              )}
            </div>
          )}

          {errorType === 'NETWORK_ERROR' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-semibold text-blue-800 mb-1">Troubleshooting Tips:</h4>
              <ul className="text-sm text-blue-700 list-disc pl-4 space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>If using VPN, try disabling it</li>
                <li>Contact your network administrator</li>
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              {config.actionText}
            </Button>
          )}

          {onReset && (
            <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
              Go Back
            </Button>
          )}

          {config.showHomeButton && (
            <Button variant="ghost" onClick={handleHomeClick} className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}