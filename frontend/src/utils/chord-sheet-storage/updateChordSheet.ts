import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';

/**
 * Update a ChordSheet in saved chord sheets storage
 * @param artist Artist of the chord sheet to update
 * @param title Title of the chord sheet to update  
 * @param updatedChordSheet Updated chord sheet data
 */
export const updateChordSheet = async (artist: string, title: string, updatedChordSheet: ChordSheet): Promise<void> => {
  try {
    const chordSheetStore = new ChordSheetStore();
    // Generate the path key from artist and title
    const pathKey = `${artist.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    await chordSheetStore.store(updatedChordSheet, true, pathKey);
  } catch (error) {
    console.error('Error updating chord sheet:', error);
    throw error;
  }
};
