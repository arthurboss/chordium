import { ChordSheet } from '../../types/chordSheet';
import { ChordSheetRepository } from '../../storage/repositories/chord-sheet-repository';

/**
 * Retrieves a chord sheet from IndexedDB by path
 */
export async function getChordSheet(path: string): Promise<ChordSheet | null> {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    const record = await repository.getByPath(path);
    return record?.chordSheet || null;
  } catch (error) {
    console.error('Failed to get chord sheet from IndexedDB:', error);
    return null;
  } finally {
    await repository.close();
  }
}
