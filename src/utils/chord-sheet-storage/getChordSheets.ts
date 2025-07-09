import { ChordSheet } from '@/types/chordSheet';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

/**
 * Get all ChordSheet objects from myChordSheets cache
 * @returns Array of ChordSheet objects, empty array if none exist or on error
 */
export const getChordSheets = (): ChordSheet[] => {
  return unifiedChordSheetCache.getAllSavedChordSheets();
};
