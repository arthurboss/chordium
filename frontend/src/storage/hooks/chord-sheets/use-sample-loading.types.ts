/**
 * Return type for the sample loading hook
 */
export interface UseSampleLoadingResult {
  /** Whether samples are currently being loaded */
  isLoadingSamples: boolean;
  /** Any error from sample loading */
  sampleError: Error | null;
  /** Function to trigger sample loading */
  loadSamples: () => Promise<void>;
}
