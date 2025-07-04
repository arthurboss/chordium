import { CacheConfig } from '../../types/unified-chord-sheet-cache';

/**
 * Default configuration for the unified chord sheet cache
 */
export const getDefaultCacheConfig = (): CacheConfig => ({
  regularExpirationTime: 24 * 60 * 60 * 1000,  // 24 hours
  savedExpirationTime: Number.MAX_SAFE_INTEGER, // Saved songs never expire - users manage them manually
  maxRegularItems: 30,
  maxSavedItems: 100,
  storageKey: 'chordium-chord-sheet-cache' // For compatibility (not used in IndexedDB)
});
