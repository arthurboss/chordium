/**
 * Return type for the sample loading integration hook
 */
export interface UseSampleLoadingIntegrationResult {
  /** Whether samples are currently being loaded */
  isSampleLoading: boolean;
  /** Any error from sample loading operations */
  sampleError: Error | null;
  /** Function to trigger sample loading */
  loadSamples: () => Promise<void>;
}
