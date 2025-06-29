import { ChordSheet } from '@/types/chordSheet';
import { getAllFromMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';

/**
 * Get all ChordSheet objects from myChordSheets cache
 * @returns Array of ChordSheet objects, empty array if none exist or on error
 */
export const getChordSheets = (): ChordSheet[] => {
  return getAllFromMyChordSheets();
};
