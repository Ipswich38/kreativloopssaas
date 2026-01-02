'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
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
    this.setState({
      error,
      errorInfo
    });

    // Log error
    console.error('Error boundary caught an error:', error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error reporting service
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous',
        level: this.props.level || 'component'
      };

      // Send to error reporting endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', showDetails = false } = this.props;
      const { error, errorInfo, retryCount } = this.state;

      // Critical level errors - full page replacement
      if (level === 'critical') {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Critical Error
                </CardTitle>
                <CardDescription>
                  The application has encountered a critical error and needs to be restarted.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    {error?.message || 'An unexpected error occurred'}
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-3">
                  <Button
                    onClick={this.handleReload}
                    className="flex-1"
                    variant="destructive"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart App
                  </Button>
                </div>

                {showDetails && error && (
                  <details className="text-xs bg-gray-50 p-3 rounded border">
                    <summary className="cursor-pointer font-medium">
                      Technical Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }

      // Page level errors
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Page Error
                </CardTitle>
                <CardDescription>
                  Something went wrong loading this page.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    {error?.message || 'The page failed to load properly'}
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-3">
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    className="flex-1"
                    disabled={retryCount >= 3}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {retryCount >= 3 ? 'Max Retries' : 'Try Again'}
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </div>

                {showDetails && error && (
                  <details className="text-xs bg-gray-50 p-3 rounded border">
                    <summary className="cursor-pointer font-medium">
                      Error Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }

      // Component level errors - inline replacement
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-red-900">
                Component Error
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {error?.message || 'This component failed to render'}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                  className="text-xs"
                >
                  {retryCount >= 3 ? 'Failed' : 'Retry'}
                </Button>
                {showDetails && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => console.log('Error:', error, 'Info:', errorInfo)}
                    className="text-xs"
                  >
                    Debug
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to report errors
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);

    // Send error to reporting service
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous',
        level: 'handled'
      })
    }).catch(reportingError => {
      console.warn('Failed to report error:', reportingError);
    });
  };

  return { reportError };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Partial<Props>
) {
  return function ErrorBoundaryWrappedComponent(props: T) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Report unhandled promise rejection
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack || 'No stack trace available',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: localStorage.getItem('userId') || 'anonymous',
          level: 'unhandled_rejection'
        })
      }).catch(() => {
        // Fail silently
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}