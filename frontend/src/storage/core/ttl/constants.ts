/**
 * Global TTL (Time-To-Live) constants for all storage systems
 * 
 * Centralizes all cache expiration settings across chord-sheets and search-cache
 * to ensure consistent cache management and prevent magic numbers in code.
 */

/**
 * Base time units (in milliseconds)
 */
const TIME_UNITS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * TTL constants for different content types and data sources
 */
export const TTL = {
  /**
   * Chord sheets cache TTL (7 days)
   * 
   * Used for cached chord sheets that haven't been saved by the user.
   * Saved chord sheets never expire.
   */
  CHORD_SHEETS: 7 * TIME_UNITS.DAY,

  /**
   * Search cache TTL by data source
   * 
   * Performance prioritized over freshness since:
   * - CifraClub data is relatively static (rarely deleted, occasionally added)
   * - Scraping should be minimized to avoid rate limiting
   * - Future cron jobs will handle data updates in backend databases
   */
  SEARCH_CACHE: {
    /** Supabase data - highly reliable, can be cached long-term */
    SUPABASE: 30 * TIME_UNITS.DAY,
    
    /** S3 data - highly reliable, can be cached long-term */
    S3: 30 * TIME_UNITS.DAY,
    
    /** CifraClub data - static content, performance over freshness */
    CIFRACLUB: 30 * TIME_UNITS.DAY,
    
    /** Default fallback for unknown data sources */
    DEFAULT: 30 * TIME_UNITS.DAY,
  },
} as const;

/**
 * Storage limits and cleanup thresholds
 */
export const LIMITS = {
  /** Total storage target (estimated quota) */
  TOTAL_STORAGE_TARGET: 100 * 1024 * 1024, // 100MB
  
  /** Cleanup threshold (trigger cleanup when usage exceeds this ratio) */
  CLEANUP_THRESHOLD: 0.8, // 80%
} as const;

/**
 * Legacy exports for backward compatibility
 * @deprecated Use TTL.CHORD_SHEETS instead
 */
export const DEFAULT_CACHE_TTL_MS = TTL.CHORD_SHEETS;
