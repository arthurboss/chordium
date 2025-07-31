import { useState, useCallback } from "react";
import { SampleChordSheetsService, indexedDBStorage } from "../../services/sample-chord-sheets";

/**
 * Sample loading logic for development mode
 */
export function useSampleLoading() {
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<Error | null>(null);

  const loadSamples = useCallback(async () => {
    try {
      setIsSampleLoading(true);
      setSampleError(null);
      const service = new SampleChordSheetsService(indexedDBStorage);
      await service.loadSampleChordSheets();
    } catch (err) {
      setSampleError(err as Error);
    } finally {
      setIsSampleLoading(false);
    }
  }, []);

  return { isSampleLoading, sampleError, loadSamples };
}
