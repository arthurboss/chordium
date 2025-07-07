/**
 * Final cleanup function to remove all legacy cache data from localStorage
 * This function removes ALL cache-related localStorage entries except theme data
 * Follows SRP: Single responsibility for final migration cleanup
 */

const LEGACY_CACHE_KEYS = [
  // Search cache
  'chordium-search-cache',
  
  // Artist cache  
  'chordium-artist-songs-cache',
  
  // Unified chord sheet cache
  'chordium-chord-sheet-cache',
  
  // Legacy chord sheet caches
  'chord-sheet-cache',
  'my-chord-sheets',
  'my-chord-sheets-cache',
  
  // Migration flags
  'indexeddb-migration-complete',
  'cache-migration-version',
  'has-migrated-to-indexeddb',
  
  // Debug flags
  'cache-debug-enabled',
  'cache-stats-tracking'
];

/**
 * Remove all legacy cache data from localStorage except theme
 * Only keeps 'hasRunInitialThemeSetup' in localStorage
 */
export const removeAllLegacyCacheData = (): void => {
  console.log('🧹 Starting final cleanup: removing all legacy cache data from localStorage');
  
  let removedCount = 0;
  
  // Remove all known legacy cache keys
  LEGACY_CACHE_KEYS.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed legacy cache key: ${key}`);
    }
  });
  
  // Check for any remaining cache-related keys we might have missed
  const allKeys = Object.keys(localStorage);
  const cachePatterns = [
    /^chordium-/,
    /cache$/i,
    /cached/i,
    /-cache-/,
    /chord.*sheet/i,
    /search.*result/i,
    /artist.*song/i
  ];
  
  allKeys.forEach(key => {
    // Skip theme data
    if (key === 'hasRunInitialThemeSetup') {
      console.log(`🎨 Preserving theme data: ${key}`);
      return;
    }
    
    // Check if this looks like cache data
    const isCacheRelated = cachePatterns.some(pattern => pattern.test(key));
    if (isCacheRelated) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed additional cache key: ${key}`);
    }
  });
  
  console.log(`🏁 Final cleanup complete: removed ${removedCount} legacy cache entries`);
  
  // Verify only theme data remains
  const remainingKeys = Object.keys(localStorage);
  console.log('📊 Remaining localStorage keys:', remainingKeys);
  
  const nonThemeKeys = remainingKeys.filter(key => key !== 'hasRunInitialThemeSetup');
  if (nonThemeKeys.length === 0) {
    console.log('✅ SUCCESS: Only theme data remains in localStorage');
  } else {
    console.warn('⚠️ WARNING: Non-theme data still present in localStorage:', nonThemeKeys);
  }
};

/**
 * Check if there's any legacy cache data still in localStorage
 * @returns true if legacy cache data exists
 */
export const hasLegacyCacheData = (): boolean => {
  const hasLegacyKeys = LEGACY_CACHE_KEYS.some(key => localStorage.getItem(key) !== null);
  
  if (hasLegacyKeys) {
    return true;
  }
  
  // Check for pattern-based cache keys
  const allKeys = Object.keys(localStorage);
  const cachePatterns = [
    /^chordium-/,
    /cache$/i,
    /cached/i,
    /-cache-/,
    /chord.*sheet/i,
    /search.*result/i,
    /artist.*song/i
  ];
  
  return allKeys.some(key => {
    if (key === 'hasRunInitialThemeSetup') return false;
    return cachePatterns.some(pattern => pattern.test(key));
  });
};

/**
 * Get summary of localStorage usage after migration
 */
export const getLocalStorageUsageSummary = (): {
  totalKeys: number;
  themeKeys: string[];
  legacyKeys: string[];
  unknownKeys: string[];
} => {
  const allKeys = Object.keys(localStorage);
  const themeKeys: string[] = [];
  const legacyKeys: string[] = [];
  const unknownKeys: string[] = [];
  
  allKeys.forEach(key => {
    if (key === 'hasRunInitialThemeSetup') {
      themeKeys.push(key);
    } else if (LEGACY_CACHE_KEYS.includes(key)) {
      legacyKeys.push(key);
    } else {
      unknownKeys.push(key);
    }
  });
  
  return {
    totalKeys: allKeys.length,
    themeKeys,
    legacyKeys,
    unknownKeys
  };
};

// Make functions globally available for browser console
declare global {
  interface Window {
    removeAllLegacyCacheData: typeof removeAllLegacyCacheData;
    hasLegacyCacheData: typeof hasLegacyCacheData;
    getLocalStorageUsageSummary: typeof getLocalStorageUsageSummary;
  }
}

// Expose functions globally in browser environment
if (typeof window !== 'undefined') {
  window.removeAllLegacyCacheData = removeAllLegacyCacheData;
  window.hasLegacyCacheData = hasLegacyCacheData;
  window.getLocalStorageUsageSummary = getLocalStorageUsageSummary;
}
