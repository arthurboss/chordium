import { useState, useRef, useEffect } from 'react';
import { useAbortController } from './useAbortController';

interface UseAsyncFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncFetchOptions {
  enabled?: boolean;
  dependencies?: unknown[];
}

/**
 * Generic hook for handling async operations with race condition protection
 * 
 * @param fetchFn - Async function to execute (must be memoized with useCallback)
 * @param options - Configuration options
 * @returns Object with data, loading, and error states
 */
export function useAsyncFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  options: UseAsyncFetchOptions = {}
): UseAsyncFetchState<T> {
  const { enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequestId = useRef<number>(0);

  // Create abort controller with dependencies
  const abortController = useAbortController(dependencies);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++currentRequestId.current;
    
    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchFn(abortController.signal);
        
        // Only update state if this is still the current request (prevent race conditions)
        if (currentRequestId.current === requestId) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        // Only update state if this is still the current request and it's not an abort error
        if (currentRequestId.current === requestId && err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    executeFetch();
  }, [enabled, abortController]);

  return { data, loading, error };
} 