import { useState, useCallback } from "react";
import { SampleChordSheetsService, indexedDBStorage } from "../../services/sample-chord-sheets";
import type { UseSampleLoadingIntegrationResult } from "./sample-loading-integration.types";

/**
 * Sample loading with React state management
 * 
 * Integrates SampleChordSheetsService with React state management for
 * development mode sample loading operations.
 * 
 * @returns Object containing sample loading state and operations
 */
export function useSampleLoadingIntegration(): UseSampleLoadingIntegrationResult {
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<Error | null>(null);

  const loadSamples = useCallback(async () => {
    try {
      setIsSampleLoading(true);
      setSampleError(null);

      const service = new SampleChordSheetsService(indexedDBStorage);
      await service.loadSampleChordSheets();
    } catch (err) {
      console.error("Failed to load sample chord sheets:", err);
      setSampleError(err as Error);
    } finally {
      setIsSampleLoading(false);
    }
  }, []);

  return {
    isSampleLoading,
    sampleError,
    loadSamples
  };
}
