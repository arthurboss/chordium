import { useRef, useEffect } from 'react';

/**
 * Custom hook to manage abort controllers for async operations
 * Automatically aborts previous requests when dependencies change
 * 
 * @param dependencies - Array of dependencies that should trigger abort
 * @returns AbortController for the current operation
 */
export function useAbortController(dependencies: unknown[] = []): AbortController {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort any in-flight request when dependencies change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this operation
    abortControllerRef.current = new AbortController();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return abortControllerRef.current!;
} 