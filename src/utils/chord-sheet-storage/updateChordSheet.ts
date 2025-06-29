import { ChordSheet } from '@/types/chordSheet';
import { updateInMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';

/**
 * Update a ChordSheet in myChordSheets cache
 * @param artist Artist of the chord sheet to update
 * @param title Title of the chord sheet to update  
 * @param updatedChordSheet Updated chord sheet data
 */
export const updateChordSheet = (artist: string, title: string, updatedChordSheet: ChordSheet): void => {
  updateInMyChordSheets(artist, title, updatedChordSheet);
};
