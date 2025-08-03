import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';

/**
 * Add a new ChordSheet to saved chord sheets storage
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = async (chordSheet: ChordSheet): Promise<void> => {
  try {
    const chordSheetStore = new ChordSheetStore();
    // Generate a path key from artist and title
    const pathKey = `${chordSheet.artist.toLowerCase().replace(/\s+/g, '-')}-${chordSheet.title.toLowerCase().replace(/\s+/g, '-')}`;
    await chordSheetStore.store(chordSheet, true, pathKey);
  } catch (error) {
    console.error('Error adding chord sheet:', error);
    throw error;
  }
};
