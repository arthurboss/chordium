import { useCallback, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface AsyncError {
  message: string;
  code?: string;
  timestamp: number;
  context?: string;
  stack?: string;
}

interface UseAsyncErrorOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: AsyncError) => void;
}

/**
 * Hook for handling async errors that can't be caught by ErrorBoundary
 * These include: event handlers, timers, promises, async/await
 */
export const useAsyncError = (options: UseAsyncErrorOptions = {}) => {
  const { showToast = true, logError = true, onError } = options;
  const [error, setError] = useState<AsyncError | null>(null);

  const captureError = useCallback((error: Error | string, context?: string) => {
    const asyncError: AsyncError = {
      message: typeof error === 'string' ? error : error?.message || 'Unknown error',
      code: error instanceof Error ? error.name : undefined,
      timestamp: Date.now(),
      context,
      stack: error instanceof Error ? error.stack : undefined,
    };

    setError(asyncError);

    if (logError) {
      console.error('Async Error Captured:', {
        ...asyncError,
        stack: error instanceof Error ? error.stack : undefined,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }

    if (showToast) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: asyncError.message,
        duration: 5000
      });
    }

    onError?.(asyncError);
  }, [showToast, logError, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for async functions
  const wrapAsync = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), context);
        return undefined;
      }
    };
  }, [captureError]);

  // Wrapper for event handlers
  const wrapEventHandler = useCallback(<T extends unknown[]>(
    handler: (...args: T) => void,
    context?: string
  ) => {
    return (...args: T) => {
      try {
        handler(...args);
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), context);
      }
    };
  }, [captureError]);

  return {
    error,
    captureError,
    clearError,
    wrapAsync,
    wrapEventHandler
  };
};

/**
 * Higher-order component for wrapping components with async error handling
 */
export const withAsyncErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options?: UseAsyncErrorOptions
) => {
  return function WrappedComponent(props: P) {
    const { captureError } = useAsyncError(options);

    // Add global error handling for this component's scope
    useEffect(() => {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        captureError(new Error(event.reason), 'unhandled-promise-rejection');
      };

      const handleError = (event: ErrorEvent) => {
        captureError(new Error(event.error), 'global-error');
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }, [captureError]);

    return <Component {...props} />;
  };
};
