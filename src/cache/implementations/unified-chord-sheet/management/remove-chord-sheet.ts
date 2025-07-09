import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Removes a chord sheet from the cache
 * This permanently deletes the chord sheet from storage
 * 
 * @param repository - The chord sheet repository instance
 * @param artist - Artist name
 * @param title - Song title
 */
export async function removeChordSheet(
  repository: ChordSheetRepository,
  artist: string,
  title: string
): Promise<void> {
  try {
    await repository.delete(artist, title);
  } catch (error) {
    console.error('Failed to remove chord sheet from IndexedDB:', error);
  }
}
