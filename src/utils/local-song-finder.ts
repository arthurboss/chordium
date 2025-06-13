import { getSongs, migrateSongsFromOldStorage } from './unified-song-storage';
import { extractSongMetadata } from './metadata-extraction';
import { Song } from '../types/song';

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
    // Ensure migration has happened
    migrateSongsFromOldStorage();
    
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
      // Extract metadata from the song content if needed
      const metadata = extractSongMetadata(foundSong.path);
      return {
        title: foundSong.title ?? '',
        artist: foundSong.artist ?? '',
        path: foundSong.path,
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
