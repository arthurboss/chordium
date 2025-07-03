import { ChordSheet } from '@/types/chordSheet';
import { unifiedChordSheetCache } from '../cache/implementations/unified-chord-sheet-cache';

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
    console.log('🏭 Production mode: Skipping sample song population');
    return;
  }

  console.log('🔧 Development mode detected, checking My Chord Sheets cache...');

  // Check if My Chord Sheets is already populated
  const existingSongs = unifiedChordSheetCache.getAllSavedChordSheets();
  if (existingSongs.length > 0) {
    console.log('📚 My Chord Sheets already populated, skipping sample song initialization');
    return;
  }

  console.log('🔧 Development mode: Populating My Chord Sheets with sample chord sheets...');
  
  // Add each sample chord sheet to My Chord Sheets
  sampleChordSheets.forEach((chordSheet) => {
    unifiedChordSheetCache.cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    unifiedChordSheetCache.setSavedStatus(chordSheet.artist, chordSheet.title, true);
    console.log(`➕ Added "${chordSheet.title}" by ${chordSheet.artist} to My Chord Sheets`);
  });

  console.log(`✅ Successfully populated My Chord Sheets with ${sampleChordSheets.length} sample songs`);
}

/**
 * Loads sample chord sheets from JSON files
 * Follows SRP: Single responsibility of loading sample data
 * 
 * @returns Promise<ChordSheet[]> - Array of loaded chord sheets
 */
export async function loadSampleChordSheets(): Promise<ChordSheet[]> {
  try {
    console.log('📖 Loading sample chord sheets from JSON files...');

    // Load the chord sheet data from JSON files using the renamed files
    const [wonderwallResponse, hotelCaliforniaResponse] = await Promise.all([
      fetch('/data/songs/oasis-wonderwall.json'),
      fetch('/data/songs/eagles-hotel_california.json')
    ]);

    if (!wonderwallResponse.ok || !hotelCaliforniaResponse.ok) {
      throw new Error('Failed to fetch sample song files');
    }

    const [wonderwallChordSheet, hotelCaliforniaChordSheet] = await Promise.all([
      wonderwallResponse.json() as Promise<ChordSheet>,
      hotelCaliforniaResponse.json() as Promise<ChordSheet>
    ]);

    console.log('✅ Successfully loaded sample chord sheets');
    return [wonderwallChordSheet, hotelCaliforniaChordSheet];
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
