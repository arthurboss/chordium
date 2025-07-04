import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Add a new ChordSheet to IndexedDB storage (My Chord Sheets)
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = async (chordSheet: ChordSheet): Promise<void> => {
  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    await repository.store(chordSheet.artist, chordSheet.title, chordSheet, { saved: true });
    console.log(`✅ Chord sheet saved to IndexedDB: "${chordSheet.title}" by "${chordSheet.artist}"`);
  } catch (error) {
    console.error('❌ Failed to save chord sheet to IndexedDB:', error);
    throw error;
  } finally {
    await repository.close();
  }
};
