import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';

/**
 * Delete a ChordSheet from myChordSheets cache
 * @param title Title of the chord sheet to delete
 * @param artist Artist of the chord sheet to delete
 */
export const deleteChordSheet = (title: string, artist: string): void => {
  unifiedChordSheetCache.removeChordSheet(artist, title);
};
