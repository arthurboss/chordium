import { extractSongMetadata } from './metadata-extraction';
import getAllSaved from '@/storage/stores/chord-sheets/operations/get-all-saved';
import { storedToChordSheet } from '@/storage/services/chord-sheets/conversion';

export interface LocalSongResult {
  title: string;
  artist: string;
  path: string;
  key: string;
  tuning: string;
  capo: string;
}

/**
 * Finds a song in local storage (My Chord Sheets) by artist and song parameters
 * Uses IndexedDB storage system to search saved chord sheets
 * 
 * @param artistParam - URL-encoded artist parameter (e.g., "eagles", "oasis")
 * @param songParam - URL-encoded song parameter (e.g., "hotel-california")
 * @returns Promise<LocalSongResult | null> - Found song or null if not found
 */
export async function findLocalSong(
  artistParam: string, 
  songParam: string
): Promise<LocalSongResult | null> {
  try {
    // Get all saved chord sheets from IndexedDB
    const savedChordSheets = await getAllSaved();
    
    const artistName = decodeURIComponent(artistParam.replace(/-/g, ' '));
    const songName = decodeURIComponent(songParam.replace(/-/g, ' '));
    
    // Search in saved chord sheets
    const foundStored = savedChordSheets.find((stored) => {
      const storedArtist = stored.artist?.toLowerCase() ?? '';
      const storedTitle = stored.title?.toLowerCase() ?? '';
      return (
        storedArtist.includes(artistName.toLowerCase()) ||
        storedTitle.includes(songName.toLowerCase()) ||
        storedTitle === songName.toLowerCase()
      );
    });
    
    if (foundStored) {
      // Convert to domain model
      const chordSheet = storedToChordSheet(foundStored);
      
      // Extract metadata from the chord sheet content
      const metadata = extractSongMetadata(chordSheet.songChords);
      return {
        title: chordSheet.title ?? '',
        artist: chordSheet.artist ?? '',
        path: foundStored.path, // Use the storage path for routing
        key: metadata.songKey ?? '',
        tuning: metadata.guitarTuning ?? '',
        capo: metadata.guitarTuning?.includes('Capo') ? metadata.guitarTuning : '',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading local songs:', error);
    return null;
  }
}
