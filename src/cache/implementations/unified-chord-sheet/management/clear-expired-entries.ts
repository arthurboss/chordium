import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Clears all expired cache entries from storage
 * This removes only the entries that have passed their expiration time
 * 
 * @param repository - The chord sheet repository instance
 * @returns Number of entries removed
 */
export async function clearExpiredEntries(repository: ChordSheetRepository): Promise<number> {
  try {
    return await repository.cleanupExpiredRecords();
  } catch (error) {
    console.error('Failed to clear expired entries from IndexedDB:', error);
    return 0;
  }
}
