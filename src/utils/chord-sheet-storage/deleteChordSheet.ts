import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Delete a ChordSheet from IndexedDB storage
 * @param title Title of the chord sheet to delete
 * @param artist Artist of the chord sheet to delete
 */
export const deleteChordSheet = async (title: string, artist: string): Promise<void> => {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    await repository.delete(artist, title);
  } catch (error) {
    console.error('❌ Failed to delete chord sheet from IndexedDB:', error);
    throw error;
  } finally {
    await repository.close();
  }
};
