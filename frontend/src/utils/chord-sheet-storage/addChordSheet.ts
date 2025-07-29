import { ChordSheet } from '@/types/chordSheet';
// TODO: Replace with IndexedDB implementation
// import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

/**
 * Add a new ChordSheet to myChordSheets cache
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = (chordSheet: ChordSheet): void => {
  // TODO: Implement IndexedDB chord sheet storage
  // unifiedChordSheetCache.cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet, { saved: true });
  console.warn('addChordSheet: IndexedDB implementation not yet available');
};
