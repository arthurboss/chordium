/**
 * Hook for sample chord sheets loading in development mode
 * 
 * Handles only the sample loading concern - checking environment,
 * loading samples, and tracking loading state. Isolated from saved sheets.
 */

import { useState, useCallback } from "react";
import { SampleChordSheetsService, indexedDBStorage } from "../../services/sample-chord-sheets";
import type { UseSampleLoadingResult } from "./use-sample-loading.types";

/**
 * Hook for loading sample chord sheets in development mode
 * 
 * Manages the loading of sample chord sheets into IndexedDB storage.
 * Focused only on sample loading, not on saved sheets management.
 */
export function useSampleLoading(): UseSampleLoadingResult {
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);
  const [sampleError, setSampleError] = useState<Error | null>(null);

  const loadSamples = useCallback(async () => {
    try {
      setIsLoadingSamples(true);
      setSampleError(null);

      const sampleChordSheetsService = new SampleChordSheetsService(indexedDBStorage);
      await sampleChordSheetsService.loadSampleChordSheets();

    } catch (err) {
      console.error('Failed to load sample chord sheets:', err);
      setSampleError(err as Error);
    } finally {
      setIsLoadingSamples(false);
    }
  }, []);

  return {
    isLoadingSamples,
    sampleError,
    loadSamples
  };
}
