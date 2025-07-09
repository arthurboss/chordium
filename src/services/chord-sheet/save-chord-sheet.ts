import { ChordSheet } from '../../types/chordSheet';
import { ChordSheetRepository } from '../../storage/repositories/chord-sheet-repository';

/**
 * Saves a chord sheet to IndexedDB by path
 */
export async function saveChordSheet(path: string, chordSheet: ChordSheet): Promise<void> {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    await repository.storeByPath(path, chordSheet, { saved: false });
  } catch (error) {
    console.error('Failed to save chord sheet to IndexedDB:', error);
    throw error;
  } finally {
    await repository.close();
  }
}
