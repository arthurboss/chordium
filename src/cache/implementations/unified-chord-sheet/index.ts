import { ChordSheet } from "@/types/chordSheet";
import { UnifiedChordSheetCache } from "./unified-chord-sheet-cache-class";

// Create a singleton instance
export const unifiedChordSheetCache = new UnifiedChordSheetCache();

// Export convenience functions for the unified cache
export const cacheChordSheet = async (
  artist: string,
  title: string,
  chordSheet: ChordSheet
) => await unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);

export const getCachedChordSheetByPath = async (path: string) =>
  await unifiedChordSheetCache.getCachedChordSheetByPath(path);

export const clearChordSheetCache = async () =>
  await unifiedChordSheetCache.clearAllCache();

export const clearExpiredChordSheetCache = async () =>
  await unifiedChordSheetCache.clearExpiredEntries();

export const getAllChordSheets = async () =>
  await unifiedChordSheetCache.getAllChordSheets();

export const removeChordSheetByPath = async (path: string) =>
  await unifiedChordSheetCache.removeChordSheetByPath(path);

// Export the main class
export { UnifiedChordSheetCache };
