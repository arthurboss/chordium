import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '@/storage/repositories/chord-sheet-repository';

/**
 * Populates My Chord Sheets with sample songs in development mode only
 * Follows SRP: Single responsibility of development mode sample song initialization
 * 
 * @param sampleChordSheets - Array of sample chord sheets to add
 * @returns Promise<void>
 */
export async function populateDevModeSampleSongs(sampleChordSheets: ChordSheet[]): Promise<void> {
  console.log('🔧 Development mode: Checking IndexedDB for existing songs...');

  const repository = new ChordSheetRepository();
  
  try {
    await repository.initialize();
    
    // Check if My Chord Sheets is already populated in IndexedDB
    const existingSongs = await repository.getAllSaved();
    if (existingSongs.length > 0) {
      console.log('📚 My Chord Sheets already populated in IndexedDB, skipping sample song initialization');
      return;
    }

    console.log('🔧 Development mode: Populating IndexedDB with sample chord sheets...');
    
    // Add each sample chord sheet to IndexedDB
    for (const chordSheet of sampleChordSheets) {
      await repository.store(chordSheet.artist, chordSheet.title, chordSheet, { saved: true });
      console.log(`➕ Added "${chordSheet.title}" by ${chordSheet.artist} to IndexedDB`);
    }

    console.log(`✅ Successfully populated IndexedDB with ${sampleChordSheets.length} sample songs`);
  } catch (error) {
    console.error('❌ Failed to populate sample songs in IndexedDB:', error);
  } finally {
    await repository.close();
  }
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
 * Note: This function assumes it's only called in development mode
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
