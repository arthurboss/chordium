import { ChordSheet } from '../../types/chordSheet';
import { ChordSheetRepository } from '../../storage/repositories/chord-sheet-repository';

/**
 * Retrieves a chord sheet from IndexedDB by artist and title
 */
export async function getChordSheet(artist: string, title: string): Promise<ChordSheet | null> {
  const repository = new ChordSheetRepository();
  try {
    await repository.initialize();
    const record = await repository.get(artist, title);
    return record?.chordSheet || null;
  } catch (error) {
    console.error('Failed to get chord sheet from IndexedDB:', error);
    return null;
  } finally {
    await repository.close();
  }
}
