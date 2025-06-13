import { Song } from '@/types/song';

/**
 * Unified song storage utility following SRP (Single Responsibility Principle)
 * This is the single source of truth for song storage operations
 */

// Consistent localStorage key for all song storage operations
const STORAGE_KEY = 'mySongs';

/**
 * Get songs from localStorage
 * @returns Array of songs, empty array if none exist or on error
 */
export const getSongs = (): Song[] => {
  try {
    const songs = localStorage.getItem(STORAGE_KEY);
    return songs ? JSON.parse(songs) : [];
  } catch (e) {
    console.error('Failed to get songs from localStorage:', e);
    return [];
  }
};

/**
 * Save songs to localStorage
 * @param songs Array of songs to save
 */
export const saveSongs = (songs: Song[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch (e) {
    console.error('Failed to save songs to localStorage:', e);
  }
};

/**
 * Add a new song to the beginning of the saved songs list
 * @param song Song to add
 */
export const addSong = (song: Song): void => {
  const songs = getSongs();
  saveSongs([song, ...songs]);
};

/**
 * Update an existing song by matching path (unique identifier)
 * @param updatedSong Song with updated data
 */
export const updateSong = (updatedSong: Song): void => {
  const songs = getSongs();
  const updatedSongs = songs.map(song => 
    song.path === updatedSong.path ? updatedSong : song
  );
  saveSongs(updatedSongs);
};

/**
 * Delete a song by path (unique identifier)
 * @param songPath Path of the song to delete
 */
export const deleteSong = (songPath: string): void => {
  const songs = getSongs();
  const filteredSongs = songs.filter(song => song.path !== songPath);
  saveSongs(filteredSongs);
};

/**
 * Load songs with initial/demo songs integration
 * This maintains backward compatibility with the existing loadSongs function
 * @param initialSongs Demo/sample songs to include if no saved songs exist
 * @returns Combined or existing songs
 */
export const loadSongs = (initialSongs: Song[]): Song[] => {
  const savedSongs = getSongs();
  
  if (savedSongs.length === 0) {
    // No saved songs, return initial songs
    saveSongs(initialSongs);
    return initialSongs;
  }
  
  // Check if demo songs are already included
  const hasDemoSongs = initialSongs.every(initialSong => 
    savedSongs.some(savedSong => savedSong.path === initialSong.path)
  );
  
  if (!hasDemoSongs) {
    // Demo songs not found, add them
    const combinedSongs = [...initialSongs, ...savedSongs];
    saveSongs(combinedSongs);
    return combinedSongs;
  }
  
  return savedSongs;
};

/**
 * Migration utility to move songs from old storage key to new unified key
 * This ensures data is not lost during the transition
 */
export const migrateSongsFromOldStorage = (): void => {
  try {
    const oldSongs = localStorage.getItem('chordium-songs');
    if (oldSongs) {
      const parsedOldSongs = JSON.parse(oldSongs);
      const currentSongs = getSongs();
      
      // Merge old songs with current songs, avoiding duplicates
      const mergedSongs = [...currentSongs];
      
      parsedOldSongs.forEach((oldSong: Song) => {
        const exists = mergedSongs.some(song => 
          song.title === oldSong.title && song.artist === oldSong.artist
        );
        if (!exists) {
          mergedSongs.push(oldSong);
        }
      });
      
      saveSongs(mergedSongs);
      
      // Remove old storage key after successful migration
      localStorage.removeItem('chordium-songs');
      console.log('Successfully migrated songs from old storage');
    }
  } catch (e) {
    console.error('Failed to migrate songs from old storage:', e);
  }
};
