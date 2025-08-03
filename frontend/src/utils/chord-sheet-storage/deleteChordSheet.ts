import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';

/**
 * Delete a ChordSheet from saved chord sheets storage
 * @param title Title of the chord sheet to delete
 * @param artist Artist of the chord sheet to delete
 */
export const deleteChordSheet = async (title: string, artist: string): Promise<void> => {
  try {
    const chordSheetStore = new ChordSheetStore();
    // Generate the path key from artist and title
    const pathKey = `${artist.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    await chordSheetStore.delete(pathKey);
  } catch (error) {
    console.error('Error deleting chord sheet:', error);
    throw error;
  }
};
