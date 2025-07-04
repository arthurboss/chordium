import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Update a ChordSheet in IndexedDB storage
 * @param artist Artist of the chord sheet to update
 * @param title Title of the chord sheet to update  
 * @param updatedChordSheet Updated chord sheet data
 */
export const updateChordSheet = async (artist: string, title: string, updatedChordSheet: ChordSheet): Promise<void> => {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    await repository.store(artist, title, updatedChordSheet, { saved: true });
  } catch (error) {
    console.error('❌ Failed to update chord sheet in IndexedDB:', error);
    throw error;
  } finally {
    await repository.close();
  }
};
