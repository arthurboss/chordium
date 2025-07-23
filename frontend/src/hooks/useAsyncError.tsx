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

// Singleton class to manage global error listeners
class GlobalErrorManager {
  private static instance: GlobalErrorManager | null = null;
  private listeners: Set<(error: Error, context?: string) => void> = new Set();
  private isInitialized = false;

  static getInstance(): GlobalErrorManager {
    if (!GlobalErrorManager.instance) {
      GlobalErrorManager.instance = new GlobalErrorManager();
    }
    return GlobalErrorManager.instance;
  }

  private constructor() {}

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(event.reason);
    this.notifyListeners(error, 'unhandled-promise-rejection');
  };

  private handleError = (event: ErrorEvent) => {
    const error = new Error(event.error);
    this.notifyListeners(error, 'global-error');
  };

  private notifyListeners(error: Error, context?: string) {
    this.listeners.forEach(listener => {
      try {
        listener(error, context);
      } catch (err) {
        console.error('Error in global error listener:', err);
      }
    });
  }

  subscribe(listener: (error: Error, context?: string) => void): () => void {
    this.listeners.add(listener);
    
    // Initialize global listeners only once
    if (!this.isInitialized) {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.addEventListener('error', this.handleError);
      this.isInitialized = true;
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      
      // Clean up global listeners if no more subscribers
      if (this.listeners.size === 0 && this.isInitialized) {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        window.removeEventListener('error', this.handleError);
        this.isInitialized = false;
      }
    };
  }
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
 * Uses singleton pattern to avoid duplicate global event listeners
 */
export const withAsyncErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options?: UseAsyncErrorOptions
) => {
  return function WrappedComponent(props: P) {
    const { captureError } = useAsyncError(options);

    // Subscribe to global errors using singleton pattern
    useEffect(() => {
      const globalErrorManager = GlobalErrorManager.getInstance();
      
      const unsubscribe = globalErrorManager.subscribe((error, context) => {
        captureError(error, context);
      });

      return unsubscribe;
    }, [captureError]);

    return <Component {...props} />;
  };
};
