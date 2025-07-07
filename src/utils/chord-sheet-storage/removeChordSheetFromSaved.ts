import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Remove a ChordSheet from "My Chord Sheets" (mark as not saved)
 * Does not delete the record completely, just sets saved: false
 * @param artist Artist name
 * @param title Song title
 */
export const removeChordSheetFromSaved = async (artist: string, title: string): Promise<void> => {
  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    await repository.removeFromSaved(artist, title);
    console.log(`✅ Removed "${title}" by "${artist}" from My Chord Sheets`);
  } catch (error) {
    console.error('❌ Failed to remove chord sheet from My Chord Sheets:', error);
    throw error;
  } finally {
    await repository.close();
  }
};
