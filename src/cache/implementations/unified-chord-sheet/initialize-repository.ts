import { ChordSheetRepository } from '@/cache/storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Initialize IndexedDB connection for chord sheet repository
 */
export const initializeChordSheetRepository = async (repository: ChordSheetRepository): Promise<void> => {
  await repository.initialize();
};
