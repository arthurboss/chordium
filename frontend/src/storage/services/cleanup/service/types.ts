/** Result of cleanup operation */
export interface CleanupResult {
  /** Number of chord sheets removed */
  chordSheetsRemoved: number;
  /** Number of search cache entries removed */
  searchCacheRemoved: number;
  /** Total items removed */
  totalItemsRemoved: number;
  /** Estimated space freed in bytes */
  estimatedSpaceFreed: number;
  /** Cleanup strategy used */
  strategy: string;
  /** Items that were protected from removal */
  protectedItems: number;
}
