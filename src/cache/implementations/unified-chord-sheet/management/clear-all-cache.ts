import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Clears all cached chord sheets from storage
 * This removes all chord sheet data from the cache, including saved items
 * 
 * @param repository - The chord sheet repository instance
 */
export async function clearAllCache(repository: ChordSheetRepository): Promise<void> {
  try {
    await repository.clear();
  } catch (error) {
    console.error('Failed to clear all cache from IndexedDB:', error);
  }
}
