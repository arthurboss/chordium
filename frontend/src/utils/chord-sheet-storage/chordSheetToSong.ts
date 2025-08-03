import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';

/**
 * Generate a path key from artist and title
 */
function generatePathKey(artist: string, title: string): string {
  return `${artist.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Convert ChordSheet to Song for UI compatibility using path key format
 * @param chordSheet ChordSheet object to convert
 * @returns Song object for UI layer
 */
export const chordSheetToSong = (chordSheet: ChordSheet): Song => {
  const pathKey = generatePathKey(chordSheet.artist, chordSheet.title);
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    path: pathKey // Use the path key for consistency
  };
};
