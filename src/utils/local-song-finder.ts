import { getSongs } from './unified-song-storage';
import { getCachedChordSheet } from '../cache/implementations/chord-sheet-cache';
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
 * Finds a song in local storage (My Songs) by artist and song parameters
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
    // Get all songs from unified storage
    const mySongs = getSongs();
    
    const artistName = decodeURIComponent(artistParam.replace(/-/g, ' '));
    const songName = decodeURIComponent(songParam.replace(/-/g, ' '));
    
    console.log(`Looking for song: "${songName}" by "${artistName}"`);
    console.log('Available songs:', mySongs.map(song => `"${song.title}" by "${song.artist}"`));
    
    // Search in My Songs
    const foundSong = mySongs.find((song: Song) => {
      const songArtist = song.artist?.toLowerCase() ?? '';
      const songTitle = song.title?.toLowerCase() ?? '';
      return (
        songArtist.includes(artistName.toLowerCase()) ||
        songTitle.includes(songName.toLowerCase()) ||
        songTitle === songName.toLowerCase()
      );
    });
    
    if (foundSong) {
      console.log('Found song in local storage:', foundSong.title);
      
      // Try to get the chord sheet from cache using the artist and title
      const cachedChordSheet = getCachedChordSheet(foundSong.artist, foundSong.title);
      
      if (!cachedChordSheet) {
        console.log('❌ Song found but no cached chord sheet available');
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
    
    console.log('Song not found in local storage');
    return null;
  } catch (error) {
    console.error('Error loading local songs:', error);
    return null;
  }
}
