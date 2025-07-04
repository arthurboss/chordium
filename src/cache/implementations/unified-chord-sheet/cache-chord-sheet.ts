import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';
import { CacheChordSheetOptions } from '../../types/unified-chord-sheet-cache';

/**
 * Cache a chord sheet with optional metadata
 */
export const cacheChordSheet = async (
  repository: ChordSheetRepository,
  artist: string, 
  title: string, 
  chordSheet: ChordSheet, 
  options: CacheChordSheetOptions = {}
): Promise<void> => {
  if (!artist || !title) {
    console.warn('Cannot cache chord sheet: invalid artist or title', { artist, title });
    return;
  }

  try {
    // Check if item already exists to preserve some metadata
    const existingRecord = await repository.get(artist, title);
    const wasSaved = existingRecord?.metadata.saved ?? false;
    
    // Determine final saved status
    const saved = options.saved ?? wasSaved;

    // Store the chord sheet with updated metadata
    await repository.store(artist, title, chordSheet, { saved });
  } catch (error) {
    console.error('Failed to cache chord sheet in IndexedDB:', error);
  }
};
