import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
// TODO: Replace with IndexedDB key generation
// import { generateCacheKey } from '@/cache/core/cache-key-generator';
import { generateChordSheetId } from '@/utils/chord-sheet-id-generator';

/**
 * Convert ChordSheet to Song for UI compatibility using cache key format
 * @param chordSheet ChordSheet object to convert
 * @returns Song object for UI layer
 */
export const chordSheetToSong = (chordSheet: ChordSheet): Song => {
  const cacheKey = generateChordSheetId(chordSheet.artist, chordSheet.title);
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    path: cacheKey // Use the cache key as the path for consistency
  };
};
