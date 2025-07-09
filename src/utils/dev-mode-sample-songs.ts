import { ChordSheet } from "@/types/chordSheet";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet";

/**
 * Initialize sample songs in development mode for testing purposes
 * This populates IndexedDB with sample chord sheets that appear in "My Chord Sheets"
 * Only runs in development mode to avoid polluting production data
 */
export async function initializeDevModeSampleSongs(providedChordSheets?: ChordSheet[]): Promise<void> {
  try {
    // Don't run in production
    if (!import.meta.env.DEV) {
      return;
    }

    console.log('🎵 Initializing dev mode sample songs...');

    // Default sample songs if none provided
    const sampleChordSheets = providedChordSheets || [];

    if (sampleChordSheets.length === 0) {
      console.log('No sample chord sheets provided, skipping initialization');
      return;
    }

    // Check if sample songs are already in the cache to avoid duplicates
    const existingSongs = await unifiedChordSheetCache.getAllSavedChordSheets();
    const existingTitles = new Set(existingSongs.map(song => `${song.artist}-${song.title}`));

    let addedCount = 0;

    for (const chordSheet of sampleChordSheets) {
      const songKey = `${chordSheet.artist}-${chordSheet.title}`;
      
      if (!existingTitles.has(songKey)) {
        console.log(`📝 Attempting to add sample song: ${chordSheet.artist} - ${chordSheet.title}`);
        console.log(`🎵 Song content preview: ${chordSheet.songChords.substring(0, 50)}...`);
        
        // Add as saved chord sheet
        await unifiedChordSheetCache.cacheChordSheet(
          chordSheet.artist,
          chordSheet.title,
          chordSheet,
          { saved: true, dataSource: 'sample' }
        );
        
        console.log(`✅ Successfully added sample song: ${chordSheet.artist} - ${chordSheet.title}`);
        addedCount++;
      } else {
        console.log(`⏭️  Skipped existing song: ${chordSheet.artist} - ${chordSheet.title}`);
      }
    }

    console.log(`✅ Dev mode initialization complete: ${addedCount} new sample songs added`);
  } catch (error) {
    console.error('❌ Error initializing dev mode sample songs:', error);
  }
}
