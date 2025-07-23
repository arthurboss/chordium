import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface QueryInfo {
  queryKey?: unknown[];
  queryHash?: string;
}

/**
 * Custom error handler for React Query
 * Provides centralized error handling for all queries and mutations
 */
export const handleQueryError = (error: Error, query?: QueryInfo) => {
  console.error('React Query Error:', {
    error: error.message,
    stack: error.stack,
    queryKey: query?.queryKey,
    queryHash: query?.queryHash,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });

  // Don't show toast for certain error types
  const shouldShowToast = !isNetworkError(error) && !isCancelledError(error);

  if (shouldShowToast) {
    let title = 'Something went wrong';
    let description = error.message;

    // Customize error messages based on error type
    if (isServerError(error)) {
      title = 'Server Error';
      description = 'Our servers are experiencing issues. Please try again later.';
    } else if (isClientError(error)) {
      title = 'Request Error';
      description = 'There was a problem with your request. Please check your input and try again.';
    } else if (isNetworkError(error)) {
      title = 'Network Error';
      description = 'Please check your internet connection and try again.';
    }

    toast({
      variant: 'destructive',
      title,
      description,
      duration: 5000
    });
  }
};

/**
 * Configure React Query client with error handling
 */
export const createQueryClientWithErrorHandling = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors, but retry on network/server errors
          if (isClientError(error)) {
            return false;
          }
          if (isServerError(error) || isNetworkError(error)) {
            return failureCount < 3;
          }
          return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: (failureCount, error) => {
          // Only retry on network errors for mutations
          return isNetworkError(error) && failureCount < 1;
        },
      },
    },
  });
};

// Error type detection helpers
const isNetworkError = (error: Error): boolean => {
  return error.message.includes('Network Error') || 
         error.message.includes('fetch') ||
         error.name === 'NetworkError';
};

const isServerError = (error: Error): boolean => {
  if ('status' in error && typeof error.status === 'number') {
    return error.status >= 500;
  }
  return false;
};

const isClientError = (error: Error): boolean => {
  if ('status' in error && typeof error.status === 'number') {
    return error.status >= 400 && error.status < 500;
  }
  return false;
};

const isCancelledError = (error: Error): boolean => {
  return error.name === 'AbortError' || error.message.includes('cancelled');
};

/**
 * Hook for handling React Query errors in components
 */
export const useQueryErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Query Error in ${context}:`, error);
    handleQueryError(error);
  };

  return { handleError };
};
