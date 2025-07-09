import { ChordSheetRepository } from '../storage/indexeddb/repositories/chord-sheet-repository';

/**
 * Delete a chord sheet from the cache using path as identifier
 * 
 * @param path - The unique path identifier from the API response
 * 
 * @throws Error if path is empty
 */
export async function deleteChordSheet(path: string): Promise<void> {
  if (!path || path.trim() === '') {
    throw new Error('Path is required and cannot be empty');
  }

  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    await repository.deleteByPath(path);
  } finally {
    await repository.close();
  }
}
