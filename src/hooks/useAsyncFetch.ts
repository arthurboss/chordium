import { useState, useRef, useEffect } from 'react';

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

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const abortController = new AbortController();
    const requestId = ++currentRequestId.current;
    let didCancel = false;

    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(abortController.signal);
        if (!didCancel && currentRequestId.current === requestId) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!didCancel && currentRequestId.current === requestId && err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    executeFetch();
    return () => {
      didCancel = true;
      abortController.abort();
    };
  }, [enabled, ...dependencies]);

  return { data, loading, error };
} 