import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { generateCacheKey } from '@/cache/implementations/unified-chord-sheet/utilities/generate-cache-key';

/**
 * Convert ChordSheet to Song for UI compatibility using cache key format
 * @param chordSheet ChordSheet object to convert
 * @returns Song object for UI layer
 */
export const chordSheetToSong = (chordSheet: ChordSheet): Song => {
  const cacheKey = generateCacheKey(chordSheet.artist, chordSheet.title);
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    path: cacheKey // Use the cache key as the path for consistency
  };
};
