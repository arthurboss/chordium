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

    // Check expiration based on saved status
    const now = Date.now();
    if (record.cacheInfo.expiresAt < now && record.cacheInfo.expiresAt !== Number.MAX_SAFE_INTEGER) {
      console.log(`Chord sheet cache expired (saved: ${record.metadata.saved}), removing`);
      await repository.delete(artist, title);
      return null;
    }

    return record.chordSheet;
  } catch (error) {
    console.error('Failed to get cached chord sheet from IndexedDB:', error);
    return null;
  }
};
