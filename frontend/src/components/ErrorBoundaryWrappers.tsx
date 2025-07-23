import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary specifically for React Query operations
 * Handles API failures and data fetching errors
 */
export const QueryErrorBoundary = ({ children, onError }: QueryErrorBoundaryProps) => {
  const handleQueryError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log React Query specific errors
    console.error('React Query Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary 
      level="component" 
      onError={handleQueryError}
      fallback={
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading the content. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * ErrorBoundary for route-level errors
 * Wraps entire page components
 */
export const RouteErrorBoundary = ({ children }: RouteErrorBoundaryProps) => {
  return (
    <ErrorBoundary level="page">
      {children}
    </ErrorBoundary>
  );
};

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Top-level ErrorBoundary for the entire application
 * Catches any unhandled errors that bubble up
 */
export const GlobalErrorBoundary = ({ children }: GlobalErrorBoundaryProps) => {
  return (
    <ErrorBoundary level="global">
      {children}
    </ErrorBoundary>
  );
};

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  resetKeys?: Array<string | number>;
}

/**
 * ErrorBoundary for async operations and suspense
 * Resets when dependencies change
 */
export const AsyncErrorBoundary = ({ children, resetKeys }: AsyncErrorBoundaryProps) => {
  return (
    <ErrorBoundary 
      level="component" 
      resetKeys={resetKeys}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
};
