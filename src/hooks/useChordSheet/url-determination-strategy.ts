import { toSlug } from "../../utils/url-slug-utils";

// Environment-based logging utility to prevent infinite loops in tests
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
const shouldLog = !isTestEnvironment && !isVitestRunning;

const debugLog = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.log(message, ...args);
  } else {
    // Debug: This should not print during tests
    // console.log('[BLOCKED LOG]', message, 'shouldLog:', shouldLog, 'isTest:', isTestEnvironment, 'isVitest:', isVitestRunning);
  }
};

/**
 * Path determination strategy for chord sheet fetching
 * Specific to useChordSheet hook - handles path priority logic
 * Follows SRP: Single responsibility of path determination
 */
export class URLDeterminationStrategy {
  /**
   * Determines the fetch path based on priority:
   * 1. Original song path (for accurate fetching from backend)
   * 2. Reconstructed path from artist/song params
   * 
   * @param artist - Artist parameter
   * @param song - Song parameter
   * @param originalPath - Original song path from navigation (e.g., "oficina-g3/espelhos-magicos")
   * @returns Promise<{fetchPath: string | null, storageKey: string | null, isReconstructed: boolean}>
   */
  async determineFetchUrl(
    artist?: string, 
    song?: string,
    originalPath?: string
  ): Promise<{ 
    fetchPath: string | null; 
    storageKey: string | null; 
    isReconstructed: boolean 
  }> {
    // Must have artist and song params for storage key
    if (!artist || !song) {
      return { fetchPath: null, storageKey: null, isReconstructed: false };
    }

    // Priority 1: Use original path for both fetching and storage key if available
    if (originalPath) {
      debugLog("Using original path for both fetch and storage:", originalPath);
      return { fetchPath: originalPath, storageKey: originalPath, isReconstructed: false };
    }

    // Priority 2: Reconstruct path from params (fallback)
    const artistSlug = toSlug(artist);
    const songSlug = toSlug(song);
    const reconstructedPath = `${artistSlug}/${songSlug}`;
    debugLog("Reconstructed path from params:", reconstructedPath);
    
    // For reconstructed paths, also use the path as storage key (consistent with Song.path)
    return { fetchPath: reconstructedPath, storageKey: reconstructedPath, isReconstructed: true };
  }
}
