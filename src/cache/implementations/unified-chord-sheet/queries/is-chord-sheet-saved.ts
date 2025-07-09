import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Checks if a chord sheet is marked as saved
 * This only checks the saved status, not expiration or general cache status
 * 
 * @param repository - The chord sheet repository instance
 * @param artist - Artist name
 * @param title - Song title
 * @returns true if saved and not expired
 */
export async function isChordSheetSaved(
  repository: ChordSheetRepository,
  artist: string,
  title: string
): Promise<boolean> {
  try {
    return await repository.isSaved(artist, title);
  } catch (error) {
    console.error('Failed to check saved status in IndexedDB:', error);
    return false;
  }
}
