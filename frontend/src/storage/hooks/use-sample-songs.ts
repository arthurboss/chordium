/**
 * Hook for loading sample chord sheets in development mode using IndexedDB
 * 
 * This hook provides a clean interface for loading sample songs into the new
 * IndexedDB storage system. It's designed to be a direct replacement for the
 * old localStorage-based hook, maintaining the same public API while using
 * the new storage architecture.
 */

import { useEffect, useState } from 'react';
import { SampleSongsService, indexedDBStorage } from '@/storage/services/sample-songs';

/**
 * Result of sample songs loading operation
 */
export interface UseSampleSongsResult {
  /** Whether sample songs are currently being loaded */
  isLoading: boolean;
  /** Whether the loading operation completed successfully */
  isLoaded: boolean;
  /** Any error that occurred during loading */
  error: Error | null;
}

/**
 * Hook for loading sample songs in development mode
 * 
 * Automatically loads sample chord sheets when the component mounts if:
 * - Running in development mode
 * - User doesn't already have saved chord sheets
 * 
 * Uses the new IndexedDB storage system and follows the same loading logic
 * as the previous localStorage implementation.
 * 
 * @returns Loading state and error information
 */
export function useSampleSongs(): UseSampleSongsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create service with IndexedDB storage
        const sampleSongsService = new SampleSongsService(indexedDBStorage);
        
        // Load samples (handles all conditions internally)
        await sampleSongsService.loadSampleSongs();
        
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load sample songs'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSamples();
  }, []);

  return {
    isLoading,
    isLoaded,
    error
  };
}
