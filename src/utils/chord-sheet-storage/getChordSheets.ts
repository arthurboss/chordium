import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Get all ChordSheet objects from IndexedDB storage (My Chord Sheets)
 * @returns Array of ChordSheet objects, empty array if none exist or on error
 */
export const getChordSheets = async (): Promise<ChordSheet[]> => {
  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    const chordSheets = await repository.getAllSaved();
    return chordSheets;
  } catch (error) {
    console.error('❌ Failed to get chord sheets from IndexedDB:', error);
    return [];
  } finally {
    await repository.close();
  }
};
