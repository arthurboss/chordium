import { getMyChordSheetsAsSongs } from './chord-sheet-storage';
import { unifiedChordSheetCache } from '../cache/implementations/unified-chord-sheet-cache';
import { Song } from '../types/song';
import { extractSongMetadata } from './metadata-extraction';

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
 * Follows SRP: Single responsibility of finding local songs
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
    // Get all songs from modular chord sheet storage
    const myChordSheets = getMyChordSheetsAsSongs();
    
    const artistName = decodeURIComponent(artistParam.replace(/-/g, ' '));
    const songName = decodeURIComponent(songParam.replace(/-/g, ' '));
    
    // Search in My Chord Sheets
    const foundSong = myChordSheets.find((song: Song) => {
      const songArtist = song.artist?.toLowerCase() ?? '';
      const songTitle = song.title?.toLowerCase() ?? '';
      return (
        songArtist.includes(artistName.toLowerCase()) ||
        songTitle.includes(songName.toLowerCase()) ||
        songTitle === songName.toLowerCase()
      );
    });
    
    if (foundSong) {
      
      // Try to get the chord sheet from cache using the artist and title
      const cachedChordSheet = unifiedChordSheetCache.getCachedChordSheet(foundSong.artist, foundSong.title);
      
      if (!cachedChordSheet) {
        return null;
      }
      
      // Extract metadata from the chord sheet content
      const metadata = extractSongMetadata(cachedChordSheet.songChords);
      return {
        title: foundSong.title ?? '',
        artist: foundSong.artist ?? '',
        path: cachedChordSheet.songChords, // Return the actual chord content for API compatibility
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
