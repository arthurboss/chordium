import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Checks if a chord sheet is cached (saved or regular) and not expired
 * This verifies both presence in cache and expiration status
 * 
 * @param repository - The chord sheet repository instance
 * @param artist - Artist name
 * @param title - Song title
 * @returns true if cached and not expired
 */
export async function isChordSheetCached(
  repository: ChordSheetRepository,
  artist: string,
  title: string
): Promise<boolean> {
  try {
    const record = await repository.get(artist, title);
    
    if (!record) {
      return false;
    }

    // Check expiration
    const now = Date.now();
    if (record.cacheInfo.expiresAt < now && record.cacheInfo.expiresAt !== Number.MAX_SAFE_INTEGER) {
      await repository.delete(artist, title);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to check cached status in IndexedDB:', error);
    return false;
  }
}
