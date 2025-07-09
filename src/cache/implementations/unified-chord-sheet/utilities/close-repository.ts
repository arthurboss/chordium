import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Closes the IndexedDB connection for the repository
 * This should be called when the cache is no longer needed to free resources
 * 
 * @param repository - The chord sheet repository instance
 * @param setInitialized - Function to update the initialization status
 */
export async function closeRepository(
  repository: ChordSheetRepository,
  setInitialized: (status: boolean) => void
): Promise<void> {
  await repository.close();
  setInitialized(false);
}
