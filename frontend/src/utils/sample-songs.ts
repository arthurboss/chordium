import { Song } from '../types/song';
import { ChordSheet } from '../types/chordSheet';
import { toSlug } from './url-slug-utils';
import { initializeDevModeSampleSongs } from './dev-mode-sample-songs';

// Cache for sample song content - prevent duplicate fetches
let cachedSongs: Song[] | null = null;

/**
 * Load sample ChordSheet objects for caching or direct use
 * @returns Array of ChordSheet objects with full metadata
 */
export const loadSampleChordSheets = async (): Promise<ChordSheet[]> => {
  // Load the chord sheet data from JSON files using corrected filenames
  const hotelCaliforniaResponse = await fetch('/data/songs/eagles-hotel_california.json');
  const hotelCaliforniaChordSheet: ChordSheet = await hotelCaliforniaResponse.json();
  
  const wonderwallResponse = await fetch('/data/songs/oasis-wonderwall.json');
  const wonderwallChordSheet: ChordSheet = await wonderwallResponse.json();
  
  return [wonderwallChordSheet, hotelCaliforniaChordSheet];
};

export const loadSampleSongs = async (): Promise<Song[]> => {
  // Return cached songs if available
  if (cachedSongs) {
    return cachedSongs;
  }

  // Load the chord sheet data from JSON files using the renamed files
  const hotelCaliforniaResponse = await fetch('/data/songs/eagles-hotel_california.json');
  const hotelCaliforniaChordSheet: ChordSheet = await hotelCaliforniaResponse.json();
  
  const wonderwallResponse = await fetch('/data/songs/oasis-wonderwall.json');
  const wonderwallChordSheet: ChordSheet = await wonderwallResponse.json();
  
  // Initialize dev mode sample songs in My Chord Sheets (only in dev mode)
  // Pass the loaded chord sheets to the dev mode initializer
  const chordSheets = [wonderwallChordSheet, hotelCaliforniaChordSheet];
  await initializeDevModeSampleSongs(chordSheets);
  
  // Convert ChordSheet objects to Song objects with consistent paths
  const songs: Song[] = [
    {
      title: wonderwallChordSheet.title,
      artist: wonderwallChordSheet.artist,
      path: `${toSlug(wonderwallChordSheet.artist)}/${toSlug(wonderwallChordSheet.title)}` // Generate consistent path for navigation
    },
    {
      title: hotelCaliforniaChordSheet.title,
      artist: hotelCaliforniaChordSheet.artist,
      path: `${toSlug(hotelCaliforniaChordSheet.artist)}/${toSlug(hotelCaliforniaChordSheet.title)}` // Generate consistent path for navigation
    }
  ];
  
  // Cache the result
  cachedSongs = songs;
  
  return songs;
};
