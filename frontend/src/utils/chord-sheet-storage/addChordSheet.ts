import { ChordSheet } from '@/types/chordSheet';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

/**
 * Add a new ChordSheet to myChordSheets cache
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = (chordSheet: ChordSheet): void => {
  unifiedChordSheetCache.cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet, { saved: true });
};
