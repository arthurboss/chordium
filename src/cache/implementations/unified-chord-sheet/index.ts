import { ChordSheet } from "@/types/chordSheet";
import { UnifiedChordSheetCache } from './unified-chord-sheet-cache-class';

// Create a singleton instance
export const unifiedChordSheetCache = new UnifiedChordSheetCache();

// Export convenience functions for the unified cache
export const cacheChordSheet = async (artist: string, title: string, chordSheet: ChordSheet) => 
  await unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);

export const getCachedChordSheet = async (artist: string, title: string) => 
  await unifiedChordSheetCache.getCachedChordSheet(artist, title);

export const clearChordSheetCache = async () => 
  await unifiedChordSheetCache.clearAllCache();

export const clearExpiredChordSheetCache = async () => 
  await unifiedChordSheetCache.clearExpiredEntries();

// Export the main class
export { UnifiedChordSheetCache };
