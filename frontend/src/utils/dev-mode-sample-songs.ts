import { ChordSheet } from '@/types/chordSheet';
import { unifiedChordSheetCache } from '../cache/implementations/unified-chord-sheet-cache';
import wonderwall from '../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';

/**
 * Populates My Chord Sheets with sample songs in development mode only
 * Follows SRP: Single responsibility of development mode sample song initialization
 * 
 * @param sampleChordSheets - Array of sample chord sheets to add
 * @returns Promise<void>
 */
export async function populateDevModeSampleSongs(sampleChordSheets: ChordSheet[]): Promise<void> {
  // Check development mode using build-time environment variable only
  // Runtime checks like hostname are unreliable for build-time decisions
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
}

/**
 * Loads sample chord sheets from JSON files
 * Follows SRP: Single responsibility of loading sample data
 * 
 * @returns Promise<ChordSheet[]> - Array of loaded chord sheets
 */
export async function loadSampleChordSheets(): Promise<ChordSheet[]> {
  try {
    // Return the imported chord sheets directly
    return [wonderwall, hotelCalifornia];
  } catch (error) {
    console.error('❌ Failed to load sample chord sheets:', error);
    return [];
  }
}

/**
 * Main function to initialize sample songs in development mode
 * Follows SRP: Single responsibility of sample song initialization
 * 
 * @param providedChordSheets - Optional array of chord sheets to use instead of loading from files
 * @returns Promise<void>
 */
export async function initializeDevModeSampleSongs(providedChordSheets?: ChordSheet[]): Promise<void> {
  try {
    const sampleChordSheets = providedChordSheets || await loadSampleChordSheets();
    if (sampleChordSheets.length > 0) {
      await populateDevModeSampleSongs(sampleChordSheets);
    }
  } catch (error) {
    console.error('❌ Failed to initialize dev mode sample songs:', error);
  }
}
