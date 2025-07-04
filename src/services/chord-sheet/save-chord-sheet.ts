import { ChordSheet } from '../../types/chordSheet';
import { ChordSheetRepository } from '../../storage/repositories/chord-sheet-repository';

/**
 * Saves a chord sheet to IndexedDB by artist and title
 */
export async function saveChordSheet(artist: string, title: string, chordSheet: ChordSheet): Promise<void> {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    await repository.store(artist, title, chordSheet, { saved: true });
  } catch (error) {
    console.error('Failed to save chord sheet to IndexedDB:', error);
    throw error;
  } finally {
    await repository.close();
  }
}
