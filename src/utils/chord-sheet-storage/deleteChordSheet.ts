import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Remove a ChordSheet from "My Chord Sheets" (mark as not saved)
 * @param title Title of the chord sheet to remove
 * @param artist Artist of the chord sheet to remove
 */
export const deleteChordSheet = async (title: string, artist: string): Promise<void> => {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    await repository.removeFromSaved(artist, title);
  } catch (error) {
    console.error('❌ Failed to remove chord sheet from My Chord Sheets:', error);
    throw error;
  } finally {
    await repository.close();
  }
};
