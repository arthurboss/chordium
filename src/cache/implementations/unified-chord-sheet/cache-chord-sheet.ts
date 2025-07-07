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
    // Check if item already exists and if it's saved
    const wasSaved = await repository.isSaved(artist, title);
    
    // Determine final saved status - if options.saved is specified, use it, otherwise preserve existing saved status
    const shouldSave = options.saved ?? wasSaved;

    // Store the chord sheet with appropriate method
    if (shouldSave) {
      await repository.save(artist, title, chordSheet);
    } else {
      await repository.cache(artist, title, chordSheet);
    }
  } catch (error) {
    console.error('Failed to cache chord sheet in IndexedDB:', error);
  }
};
