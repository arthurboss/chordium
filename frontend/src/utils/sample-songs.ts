import { Song } from '../types/song';
import { ChordSheet } from '../types/chordSheet';
import { toSlug } from './url-slug-utils';
import { unifiedChordSheetCache } from '../cache/implementations/unified-chord-sheet-cache';

// Cache for sample song content - prevent duplicate fetches
let cachedSongs: Song[] | null = null;

/**
 * Load sample ChordSheet objects for caching or direct use
 * Only loads fixtures in development mode, returns empty array in production
 * @returns Array of ChordSheet objects with full metadata
 */
export const loadSampleChordSheets = async (): Promise<ChordSheet[]> => {
  // In production, return empty array
  if (!import.meta.env.DEV) {
    return [];
  }

  try {
    // Dynamic imports only in development mode to prevent bundling in production
    const [wonderwallModule, hotelCaliforniaModule] = await Promise.all([
      import('../../../shared/fixtures/chord-sheet/oasis-wonderwall.json'),
      import('../../../shared/fixtures/chord-sheet/eagles-hotel_california.json')
    ]);

    return [wonderwallModule.default, hotelCaliforniaModule.default] as ChordSheet[];
  } catch (error) {
    console.warn('Failed to load sample chord sheets in development mode:', error);
    return [];
  }
};

/**
 * Populates My Chord Sheets with sample songs in development mode only
 */
const populateDevModeSampleSongs = (sampleChordSheets: ChordSheet[]): void => {
  // Check development mode using build-time environment variable only
  const isDev = import.meta.env.DEV;

  if (!isDev) {
    return;
  }

  // Check if My Chord Sheets is already populated
  const existingSongs = unifiedChordSheetCache.getAllSavedChordSheets();
  if (existingSongs.length > 0) {
    return;
  }

  // Add each sample chord sheet to My Chord Sheets
  sampleChordSheets.forEach((chordSheet) => {
    unifiedChordSheetCache.cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    unifiedChordSheetCache.setSavedStatus(chordSheet.artist, chordSheet.title, true);
  });
};

export const loadSampleSongs = async (): Promise<Song[]> => {
  // Return cached songs if available
  if (cachedSongs) {
    return cachedSongs;
  }

  // In production, return empty array
  if (!import.meta.env.DEV) {
    cachedSongs = [];
    return cachedSongs;
  }

  try {
    // Load chord sheets dynamically only in development
    const chordSheets = await loadSampleChordSheets();
    
    if (chordSheets.length === 0) {
      cachedSongs = [];
      return cachedSongs;
    }

    // Initialize dev mode sample songs in My Chord Sheets (only in dev mode)
    populateDevModeSampleSongs(chordSheets);
    
    // Convert ChordSheet objects to Song objects with consistent paths
    const songs: Song[] = chordSheets.map(sheet => ({
      title: sheet.title,
      artist: sheet.artist,
      path: `${toSlug(sheet.artist)}/${toSlug(sheet.title)}`
    }));
    
    // Cache the result
    cachedSongs = songs;
    
    return songs;
  } catch (error) {
    console.warn('Failed to load sample songs in development mode:', error);
    cachedSongs = [];
    return cachedSongs;
  }
};
