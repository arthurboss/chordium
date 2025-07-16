import { Song } from '../types/song';
import { ChordSheet } from '../types/chordSheet';
import { toSlug } from './url-slug-utils';
import { initializeDevModeSampleSongs } from './dev-mode-sample-songs';
import wonderwall from '../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';

// Cache for sample song content - prevent duplicate fetches
let cachedSongs: Song[] | null = null;

/**
 * Load sample ChordSheet objects for caching or direct use
 * @returns Array of ChordSheet objects with full metadata
 */
export const loadSampleChordSheets = async (): Promise<ChordSheet[]> => {
  // Return the imported chord sheets directly
  return [wonderwall, hotelCalifornia];
};

export const loadSampleSongs = async (): Promise<Song[]> => {
  // Return cached songs if available
  if (cachedSongs) {
    return cachedSongs;
  }

  // Use the imported chord sheets directly
  const chordSheets = [wonderwall, hotelCalifornia];
  
  // Initialize dev mode sample songs in My Chord Sheets (only in dev mode)
  // Pass the loaded chord sheets to the dev mode initializer
  await initializeDevModeSampleSongs(chordSheets);
  
  // Convert ChordSheet objects to Song objects with consistent paths
  const songs: Song[] = [
    {
      title: wonderwall.title,
      artist: wonderwall.artist,
      path: `${toSlug(wonderwall.artist)}/${toSlug(wonderwall.title)}` // Generate consistent path for navigation
    },
    {
      title: hotelCalifornia.title,
      artist: hotelCalifornia.artist,
      path: `${toSlug(hotelCalifornia.artist)}/${toSlug(hotelCalifornia.title)}` // Generate consistent path for navigation
    }
  ];
  
  // Cache the result
  cachedSongs = songs;
  
  return songs;
};
