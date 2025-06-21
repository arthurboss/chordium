import { Song } from '@/types/song';

/**
 * Creates a normalized identifier for song comparison
 * @param artist - Artist name or song path
 * @param title - Song title (optional if artist is actually a path)
 * @returns Normalized identifier string
 */
export function createSongIdentifier(artist: string, title?: string): string {
  if (title === undefined) {
    // If only one parameter, treat it as a path or title
    return artist.toLowerCase().trim();
  }
  
  // Always return artist|title format, even if empty
  return `${artist.toLowerCase().trim()}|${title.toLowerCase().trim()}`;
}

/**
 * Finds an existing song in the collection by artist/title or path
 * @param songs - Collection of songs to search
 * @param artistOrPath - Artist name or full song path
 * @param title - Song title (optional if first param is path)
 * @returns Found song or undefined
 */
export function findExistingSong(
  songs: Song[], 
  artistOrPath: string, 
  title?: string
): Song | undefined {
  if (!songs || songs.length === 0) {
    return undefined;
  }

  // If title is provided, search by artist + title
  if (title) {
    const searchIdentifier = createSongIdentifier(artistOrPath, title);
    
    return songs.find(song => {
      // Allow empty artist matching if both are empty
      const songArtist = song.artist || '';
      const songTitle = song.title || '';
      
      if (!songTitle) {
        return false;
      }
      
      const songIdentifier = createSongIdentifier(songArtist, songTitle);
      return songIdentifier === searchIdentifier;
    });
  }

  // If no title, treat first param as path or try to find by title only
  return songs.find(song => {
    // Try exact path match first
    if (song.path && song.path.toLowerCase() === artistOrPath.toLowerCase()) {
      return true;
    }
    
    // Try title match if no path match
    if (song.title && song.title.toLowerCase() === artistOrPath.toLowerCase()) {
      return true;
    }
    
    return false;
  });
}

/**
 * Navigation callback interface
 */
export interface NavigationCallbacks {
  navigate?: (path: string) => void;
  setSelectedSong?: (song: Song | null) => void;
  setActiveTab?: (tab: string) => void;
}

/**
 * Checks if a song exists in my songs and navigates to it if found
 * @param mySongs - User's saved songs
 * @param artistOrPath - Artist name or song path
 * @param title - Song title (optional)
 * @param callbacks - Navigation callback functions
 * @returns true if song was found and navigation initiated, false otherwise
 */
export function shouldOpenExistingSong(
  mySongs: Song[],
  artistOrPath: string,
  title?: string,
  callbacks: NavigationCallbacks = {}
): boolean {
  const existingSong = findExistingSong(mySongs, artistOrPath, title);
  
  if (existingSong) {
    // Navigate to the existing song in My Songs
    if (callbacks.navigate && existingSong.path) {
      callbacks.navigate(`/my-songs/${existingSong.path}`);
    }
    
    if (callbacks.setSelectedSong) {
      callbacks.setSelectedSong(existingSong);
    }
    
    if (callbacks.setActiveTab) {
      callbacks.setActiveTab('my-songs');
    }
    
    return true;
  }
  
  return false;
}
