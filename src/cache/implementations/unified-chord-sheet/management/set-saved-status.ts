import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Sets the saved status of a chord sheet in the cache
 * This modifies whether a chord sheet is marked as saved by the user
 * 
 * @param repository - The chord sheet repository instance
 * @param artist - Artist name
 * @param title - Song title
 * @param saved - Whether the chord sheet should be saved
 * @returns true if successful, false if chord sheet not found
 */
export async function setSavedStatus(
  repository: ChordSheetRepository,
  artist: string,
  title: string,
  saved: boolean
): Promise<boolean> {
  try {
    const record = await repository.get(artist, title);
    
    if (!record) {
      return false;
    }

    // Update the record with new saved status
    await repository.store(artist, title, record.chordSheet, { saved });
    return true;
  } catch (error) {
    console.error('Failed to update saved status in IndexedDB:', error);
    return false;
  }
}
