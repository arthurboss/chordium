import { removeFromMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';

/**
 * Delete a ChordSheet from myChordSheets cache
 * @param title Title of the chord sheet to delete
 * @param artist Artist of the chord sheet to delete
 */
export const deleteChordSheet = (title: string, artist: string): void => {
  removeFromMyChordSheets(artist, title);
};
