import { ChordSheet } from '@/types/chordSheet';
import { addToMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';
import { cacheChordSheet } from '@/cache/implementations/chord-sheet-cache';

/**
 * Add a new ChordSheet to myChordSheets cache
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = (chordSheet: ChordSheet): void => {
  addToMyChordSheets(chordSheet.artist, chordSheet.title, chordSheet);
  
  // Also cache the chord sheet for performance in regular cache
  cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
};
