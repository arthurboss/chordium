import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Get cached chord sheet if it exists and is not expired
 */
export const getCachedChordSheet = async (
  repository: ChordSheetRepository,
  artist: string, 
  title: string
): Promise<ChordSheet | null> => {
  if (!artist || !title) {
    console.warn('Cannot retrieve chord sheet: invalid artist or title', { artist, title });
    return null;
  }

  try {
    const record = await repository.get(artist, title);
    
    if (!record) {
      return null;
    }

    // Check expiration - saved items never expire, cached items have TTL
    const isSaved = await repository.isSaved(artist, title);
    const chordSheet = await repository.get(artist, title);
    
    if (!chordSheet && !isSaved) {
      console.log(`Chord sheet cache expired (saved: ${isSaved}), already removed`);
      return null;
    }

    return chordSheet;
  } catch (error) {
    console.error('Failed to get cached chord sheet from IndexedDB:', error);
    return null;
  }
};
