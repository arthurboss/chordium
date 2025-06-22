import { ChordSheet } from '@/types/chordSheet';
import { addToMySongs, getAllFromMySongs } from '../cache/implementations/my-songs-cache';

/**
 * Populates My Songs with sample songs in development mode only
 * Follows SRP: Single responsibility of development mode sample song initialization
 * 
 * @param sampleChordSheets - Array of sample chord sheets to add
 * @returns Promise<void>
 */
export async function populateDevModeSampleSongs(sampleChordSheets: ChordSheet[]): Promise<void> {
  // Check development mode using multiple methods for reliability
  const isDev = import.meta.env.DEV || 
                import.meta.env.MODE === 'development' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

  if (!isDev) {
    console.log('🏭 Production mode: Skipping sample song population');
    return;
  }

  console.log('🔧 Development mode detected, checking My Songs cache...');

  // Check if My Songs is already populated
  const existingSongs = getAllFromMySongs();
  if (existingSongs.length > 0) {
    console.log('📚 My Songs already populated, skipping sample song initialization');
    return;
  }

  console.log('🔧 Development mode: Populating My Songs with sample chord sheets...');
  
  // Add each sample chord sheet to My Songs
  sampleChordSheets.forEach((chordSheet) => {
    addToMySongs(chordSheet.artist, chordSheet.title, chordSheet);
    console.log(`➕ Added "${chordSheet.title}" by ${chordSheet.artist} to My Songs`);
  });

  console.log(`✅ Successfully populated My Songs with ${sampleChordSheets.length} sample songs`);
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
