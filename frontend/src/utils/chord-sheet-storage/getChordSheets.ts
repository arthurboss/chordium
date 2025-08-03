import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';

/**
 * Get all ChordSheet objects from saved chord sheets storage
 * @returns Promise that resolves to array of ChordSheet objects, empty array if none exist or on error
 */
export const getChordSheets = async (): Promise<ChordSheet[]> => {
  try {
    const chordSheetStore = new ChordSheetStore();
    const storedChordSheets = await chordSheetStore.getAllSaved();
    // Extract ChordSheet data from StoredChordSheet objects (StoredChordSheet extends ChordSheet)
    return storedChordSheets;
  } catch (error) {
    console.error('Error getting chord sheets:', error);
    return [];
  }
};
