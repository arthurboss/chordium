import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Gets all saved chord sheets from the cache
 * This retrieves only chord sheets that have been marked as saved by the user
 * 
 * @param repository - The chord sheet repository instance
 * @returns Array of saved ChordSheet objects
 */
export async function getAllSavedChordSheets(repository: ChordSheetRepository): Promise<ChordSheet[]> {
  try {
    return await repository.getAllSaved();
  } catch (error) {
    console.error('Failed to get all saved chord sheets from IndexedDB:', error);
    return [];
  }
}
